INSERT INTO eta.node_travel_times_samples
WITH
    25 AS segment_length_m,
    30 AS max_dist_m,
    90 AS bearing_threshold_deg,

    -- 1. SNAP: for every raw GPS ping, find the nearest node on the matching shape
    -- We also cache the snapped node's coordinates so later steps can compute bearings without
    -- repeatedly joining back to shape_nodes (cheaper and simpler downstream)
    matched_events AS (
        SELECT
            e._id as event_id,
            e.ride_id,
            e.hashed_shape_id, 
            e.created_at,
            e.latitude  AS e_lat,
            e.longitude AS e_lon,
            argMin(n.node_index,  greatCircleDistance(e.longitude, e.latitude, n.longitude, n.latitude)) AS node_idx,
            -- Carry node coords forward so we never need to re-join shape_nodes for bearing
            argMin(n.latitude,    greatCircleDistance(e.longitude, e.latitude, n.longitude, n.latitude)) AS node_lat,
            argMin(n.longitude,   greatCircleDistance(e.longitude, e.latitude, n.longitude, n.latitude)) AS node_lon,
            min(greatCircleDistance(e.longitude, e.latitude, n.longitude, n.latitude)) AS dist
        FROM eta.vehicle_events AS e
        INNER JOIN eta.shape_nodes AS n ON e.hashed_shape_id = n.shape_id
        -- CRITICAL: always filter your event range to prune partitions
        -- Replace with your actual date/time parameter
        WHERE e.created_at > 0
        GROUP BY event_id, e.ride_id, e.hashed_shape_id, e.created_at, e_lat, e_lon
        HAVING dist <= max_dist_m
    ),

    -- 2. FILTER BACKWARDS: drop any events whose snapped node index goes backwards
    -- relative to the previous event for the same ride, so downstream pairing only sees
    -- a monotonically non-decreasing node index sequence.
    matched_with_prev AS (
        SELECT
            *,
            lag(node_idx, 1) OVER w AS prev_idx_raw
        FROM matched_events
        WINDOW w AS (PARTITION BY ride_id ORDER BY created_at)
    ),

    forward_matched_events AS (
        SELECT
            event_id,
            ride_id,
            hashed_shape_id,
            created_at,
            e_lat,
            e_lon,
            node_idx,
            node_lat,
            node_lon
        FROM matched_with_prev
        WHERE prev_idx_raw IS NULL OR node_idx >= prev_idx_raw
    ),

    -- 3. PAIR: within each ride, pair every event with the immediately previous one (window over time)
    -- This keeps both the snapped node indices/coords and the original GPS positions so we can
    -- later compute time deltas, distances along the shape, and a GPS vs shape bearing comparison
    segments AS (
        SELECT
            event_id,
            hashed_shape_id,
            ride_id,
            node_idx                        AS curr_idx,
            node_lat                        AS curr_node_lat,
            node_lon                        AS curr_node_lon,
            lag(node_idx,  1) OVER w        AS prev_idx,
            lag(node_lat,  1) OVER w        AS prev_node_lat,
            lag(node_lon,  1) OVER w        AS prev_node_lon,
            created_at                      AS curr_ts,
            lag(created_at, 1) OVER w       AS prev_ts,
            e_lat                           AS curr_lat,
            e_lon                           AS curr_lon,
            lag(e_lat, 1) OVER w            AS prev_lat,
            lag(e_lon, 1) OVER w            AS prev_lon
        FROM forward_matched_events
        WINDOW w AS (PARTITION BY ride_id ORDER BY created_at)
    ),

    -- 3. CALCULATE + VALIDATE in one pass: derive time, distance and speed between consecutive
    -- snapped nodes, then immediately discard segments that are backwards, too fast/slow, or have
    -- inconsistent GPS vs shape bearings, avoiding extra subqueries or re-scans
    filtered_segments AS (
        SELECT
            event_id,
            hashed_shape_id,
            ride_id,
            curr_idx,
            prev_idx,
            curr_ts,
            prev_ts,
            curr_node_lat,
            curr_node_lon,
            prev_node_lat,
            prev_node_lon,
            (curr_ts - prev_ts) / 1000.0                    AS time_delta,
            (curr_idx - prev_idx) * segment_length_m         AS dist_m,
            (dist_m / time_delta) * 3.6                      AS speed_kmh
        FROM segments
        WHERE
            prev_idx IS NOT NULL
            AND curr_idx > prev_idx
            AND time_delta > 0
            AND speed_kmh BETWEEN 1 AND 120
            -- Bearing check using pre-fetched node coords — no subqueries
            AND abs(
                    atan2(curr_lat  - prev_lat,  curr_lon  - prev_lon) -
                    atan2(curr_node_lat - prev_node_lat, curr_node_lon - prev_node_lon)
                ) < (bearing_threshold_deg * pi() / 180)
    ),

    -- 4. EXPAND: turn each valid segment into one row per traversed node and build a
    -- monotonic per-node timestamp. We also distribute whole seconds exactly so per-node
    -- travel_time_seconds sums back to the segment time (no rounding drift).
    expanded_nodes AS (
        SELECT
            event_id,
            hashed_shape_id,
            ride_id,
            node_tuple.1 AS node_index,
            toUInt8(toHour(toDateTime(intDiv(toInt64(node_tuple.2), 1000)))) AS hour,
            node_tuple.2 AS created_at,
            node_tuple.3 AS travel_time_seconds,
            round(speed_kmh) AS speed_kmh
        FROM (
            SELECT
                event_id,
                hashed_shape_id,
                ride_id,
                speed_kmh,
                arrayJoin(
                    arrayMap(
                        i -> (
                            toUInt64(prev_idx + i),
                            toInt64(
                                prev_ts
                                + 1000 * ((i - 1) * base_sec + least(i - 1, rem_sec))
                            ),
                            toUInt32(base_sec + if(i <= rem_sec, 1, 0))
                        ),
                        range(1, toUInt64(nodes_count + 1))
                    )
                ) AS node_tuple
            FROM (
                SELECT
                    event_id,
                    hashed_shape_id,
                    ride_id,
                    prev_idx,
                    prev_ts,
                    speed_kmh,
                    nodes_count,
                    intDiv(time_delta_s, nodes_count) AS base_sec,
                    modulo(time_delta_s, nodes_count) AS rem_sec
                FROM (
                    SELECT
                        event_id,
                        hashed_shape_id,
                        ride_id,
                        prev_idx,
                        prev_ts,
                        speed_kmh,
                        toInt64(curr_idx - prev_idx) AS nodes_count,
                        greatest(
                            toInt64(round(time_delta)),
                            toInt64(curr_idx - prev_idx)
                        ) AS time_delta_s
                    FROM filtered_segments
                )
            )
        )
    ),

    -- 5. RE-TIME: enforce per-node travel time as the delta to the next emitted node timestamp
    -- so downstream sums align with node timeline spans.
    retimed_nodes AS (
        SELECT
            event_id,
            hashed_shape_id,
            ride_id,
            node_index,
            hour,
            created_at,
            toUInt32(
                if(
                    next_created_at IS NULL,
                    0,
                    greatest(intDiv(next_created_at - created_at, 1000), 0)
                )
            ) AS travel_time_seconds,
            speed_kmh
        FROM (
            SELECT
                *,
                lead(created_at, 1) OVER (
                    PARTITION BY ride_id, hashed_shape_id
                    ORDER BY node_index
                ) AS next_created_at
            FROM expanded_nodes
        )
    )

-- 6. ENRICH: attach static geometry from shape_nodes (lat/lon per node) to the per-node samples
-- so downstream consumers can aggregate travel times while still having the exact node locations
SELECT
    rn.event_id,
    rn.ride_id,
    rn.hashed_shape_id,
    rn.node_index,
    rn.hour,
    rn.created_at,
    rn.travel_time_seconds,
    rn.speed_kmh,
    sn.latitude,
    sn.longitude
FROM retimed_nodes AS rn
INNER JOIN eta.shape_nodes AS sn
    ON rn.hashed_shape_id = sn.shape_id
    AND rn.node_index = sn.node_index;
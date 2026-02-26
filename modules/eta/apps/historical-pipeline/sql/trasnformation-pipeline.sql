INSERT INTO node_travel_times_samples
WITH
    25 AS segment_length_m,
    30 AS max_dist_m,
    90 AS bearing_threshold_deg,

    -- 1. SNAP: nearest node per GPS ping
    -- Pre-aggregate node coords here to avoid re-joining shape_nodes later
    matched_events AS (
        SELECT
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
        FROM vehicle_events AS e
        INNER JOIN shape_nodes AS n ON e.hashed_shape_id = n.shape_id
        -- CRITICAL: always filter your event range to prune partitions
        -- Replace with your actual date/time parameter
        WHERE e.created_at > 0
        GROUP BY e.ride_id, e.hashed_shape_id, e.created_at, e_lat, e_lon
        HAVING dist <= max_dist_m
    ),

    -- 2. PAIR: consecutive events with window, carry both node coords
    segments AS (
        SELECT
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
        FROM matched_events
        WINDOW w AS (PARTITION BY ride_id ORDER BY created_at)
    ),

    -- 3. CALCULATE + VALIDATE in one pass — no subqueries
    filtered_segments AS (
        SELECT
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

    -- 4. EXPAND: one row per node in the segment
    expanded_nodes AS (
        SELECT
            hashed_shape_id,
            arrayJoin(range(toUInt64(prev_idx), toUInt64(curr_idx))) AS node_index,
            toUInt8(toHour(toDateTime(toInt64(prev_ts) / 1000)))     AS hour,
            prev_ts                                                   AS created_at,
            time_delta / (curr_idx - prev_idx)                       AS travel_time_seconds,
            speed_kmh
        FROM filtered_segments
    )

-- 5. ENRICH: single final join with shape_nodes for lat/lon
SELECT
    en.hashed_shape_id,
    en.node_index,
    en.hour,
    sn.latitude,
    sn.longitude,
    en.created_at,
    en.travel_time_seconds,
    en.speed_kmh
FROM expanded_nodes AS en
INNER JOIN shape_nodes AS sn
    ON en.hashed_shape_id = sn.shape_id
    AND en.node_index = sn.node_index;
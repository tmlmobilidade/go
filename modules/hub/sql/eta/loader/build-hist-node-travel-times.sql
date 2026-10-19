-- =============================================================================
-- Snaps one UTC day of historical vehicle events to shape nodes and writes one
-- row per (ride, node) traversal into eta.hist_node_travel_times.
--
-- Source: eta.hist_vehicle_events (created_at in [$chunk_start, $chunk_end))
--         eta.hist_shape_nodes     (25 m equidistant nodes, geohash-6 bucketed)
-- Target: eta.hist_node_travel_times, PARTITION BY UTC day. The loader drops the
--         day's partition before running this, so re-running a day is idempotent.
--
-- Steps
--   1. SNAP: nearest node per ping, restricted to the ping's shape and to the
--      geohash-6 cells its ±0.001° bbox touches (hash join on (shape, cell)).
--   2. FORWARD FILTER: drop pings whose node index goes backwards versus the
--      previous raw ping (local check with lag, not a running max, so a single
--      outlier costs one ping instead of poisoning the ride).
--   3. PAIR + VALIDATE: consecutive kept pings become a segment; keep segments
--      that advance, take positive time, imply 1-120 km/h over
--      (index delta × 25 m) and agree in bearing with the shape.
--   4. EXPAND: each segment becomes one row per traversed node, every node
--      receiving an equal share dt / nodes of the segment time (Float32, no
--      integer rounding, nothing lost on the last node).
--
-- Notes
--   * No SETTINGS clause on purpose: the default parallel hash join is right for
--     both joins here; a query-wide full_sorting_merge previously forced the
--     ~1B-row snap join through a single merge stream.
--   * lagInFrame(toNullable(x)) is used instead of lag(x): lag() returns the
--     type default (0) on the first row of a partition, never NULL.
-- =============================================================================

INSERT INTO eta.hist_node_travel_times (
    ride_id,
    hashed_shape_id,
    node_index,
    created_at,
    travel_time_seconds
)
WITH
    25     AS segment_length_m,
    30     AS max_dist_m,
    90     AS bearing_threshold_deg,
    0.001  AS bbox_deg,

    matched_events AS (
        SELECT
            e._id                            AS event_id,
            any(e.ride_id)                   AS ride_id,
            any(e.hashed_shape_id)           AS hashed_shape_id,
            any(e.created_at)                AS created_at,
            any(e.latitude)                  AS e_lat,
            any(e.longitude)                 AS e_lon,
            argMin(
                (n.node_index, n.latitude, n.longitude),
                greatCircleDistance(e.longitude, e.latitude, n.longitude, n.latitude)
            )                                AS nearest,
            min(greatCircleDistance(e.longitude, e.latitude, n.longitude, n.latitude)) AS dist
        FROM (
            SELECT
                _id,
                ride_id,
                hashed_shape_id,
                created_at,
                latitude,
                longitude,
                arrayJoin(
                    geohashesInBox(
                        toFloat32(longitude - bbox_deg),
                        toFloat32(latitude  - bbox_deg),
                        toFloat32(longitude + bbox_deg),
                        toFloat32(latitude  + bbox_deg),
                        6
                    )
                ) AS cell
            FROM eta.hist_vehicle_events
            WHERE
                created_at >= $chunk_start
                AND created_at < $chunk_end
        ) AS e
        INNER JOIN eta.hist_shape_nodes AS n
            ON  e.hashed_shape_id = n.hashed_shape_id
            AND e.cell            = n.geohash
            AND n.latitude  BETWEEN e.latitude  - bbox_deg AND e.latitude  + bbox_deg
            AND n.longitude BETWEEN e.longitude - bbox_deg AND e.longitude + bbox_deg
        GROUP BY e._id
        HAVING dist <= max_dist_m
    ),

    forward_matched_events AS (
        SELECT
            event_id,
            ride_id,
            hashed_shape_id,
            created_at,
            e_lat,
            e_lon,
            nearest.1 AS node_idx,
            nearest.2 AS node_lat,
            nearest.3 AS node_lon
        FROM (
            SELECT
                *,
                lagInFrame(toNullable(nearest.1)) OVER (
                    PARTITION BY ride_id
                    ORDER BY created_at, event_id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS prev_idx
            FROM matched_events
        )
        WHERE prev_idx IS NULL OR nearest.1 >= prev_idx
    ),

    filtered_segments AS (
        SELECT
            ride_id,
            hashed_shape_id,
            assumeNotNull(prev_idx) AS prev_idx,
            assumeNotNull(prev_ts)  AS prev_ts,
            curr_idx,
            curr_ts
        FROM (
            SELECT
                ride_id,
                hashed_shape_id,
                node_idx                                    AS curr_idx,
                node_lat                                    AS curr_node_lat,
                node_lon                                    AS curr_node_lon,
                lagInFrame(toNullable(node_idx))   OVER w   AS prev_idx,
                lagInFrame(node_lat)               OVER w   AS prev_node_lat,
                lagInFrame(node_lon)               OVER w   AS prev_node_lon,
                created_at                                  AS curr_ts,
                lagInFrame(toNullable(created_at)) OVER w   AS prev_ts,
                e_lat                                       AS curr_lat,
                e_lon                                       AS curr_lon,
                lagInFrame(e_lat)                  OVER w   AS prev_lat,
                lagInFrame(e_lon)                  OVER w   AS prev_lon
            FROM forward_matched_events
            WINDOW w AS (
                PARTITION BY ride_id
                ORDER BY created_at, event_id
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            )
        )
        WHERE
            prev_idx IS NOT NULL
            AND prev_ts IS NOT NULL
            AND curr_idx > prev_idx
            AND (curr_ts - prev_ts) > 0
            AND ((curr_idx - prev_idx) * segment_length_m)
                / ((curr_ts - prev_ts) / 1000.0) * 3.6
                BETWEEN 1 AND 120
            AND abs(
                    atan2(curr_lat       - prev_lat,       curr_lon       - prev_lon) -
                    atan2(curr_node_lat  - prev_node_lat,  curr_node_lon  - prev_node_lon)
                ) < (bearing_threshold_deg * pi() / 180)
    )

SELECT
    ride_id,
    hashed_shape_id,
    toUInt32(prev_idx + i)                                                    AS node_index,
    toInt64(prev_ts + intDiv((curr_ts - prev_ts) * (i - 1), nodes_count))      AS created_at,
    toFloat32((curr_ts - prev_ts) / 1000.0 / nodes_count)                      AS travel_time_seconds
FROM (
    SELECT
        ride_id,
        hashed_shape_id,
        prev_idx,
        prev_ts,
        curr_ts,
        toUInt32(curr_idx - prev_idx) AS nodes_count
    FROM filtered_segments
)
ARRAY JOIN range(1, nodes_count + 1) AS i;

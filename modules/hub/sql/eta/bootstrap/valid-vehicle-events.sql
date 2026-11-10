-- Pairwise physical validation; a two-ping lookback recovers after a single
-- forward outlier instead of retaining a running maximum forever. Cold starts
-- wait for confirmation, and gaps >120 s require another confirming ping.
CREATE OR REPLACE VIEW eta.valid_vehicle_events AS
WITH context AS (
    SELECT *,
        lagInFrame(toNullable(node_index), 1) OVER w AS prev_node,
        lagInFrame(toNullable(created_at), 1) OVER w AS prev_at,
        lagInFrame(toNullable(node_index), 2) OVER w AS prev2_node,
        lagInFrame(toNullable(created_at), 2) OVER w AS prev2_at
    FROM eta.curr_vehicle_events FINAL
    WHERE created_at >= toUnixTimestamp64Milli(now64(3)) - 2 * 3600000
    WINDOW w AS (PARTITION BY ride_id, vehicle_id, hashed_shape_id ORDER BY created_at, _id)
), checks AS (
    SELECT *,
        toInt64(node_index) - toInt64(prev_node) AS delta,
        created_at - prev_at AS gap_ms,
        toInt64(node_index) - toInt64(prev2_node) AS delta2,
        created_at - prev2_at AS gap2_ms,
        gap_ms > 0 AND gap_ms <= 120000 AND delta >= -1
            AND abs(delta) * 25. / (gap_ms / 1000.) <= 33.34 AS plausible,
        gap2_ms > 0 AND gap2_ms <= 120000 AND delta2 >= -1
            AND abs(delta2) * 25. / (gap2_ms / 1000.) <= 33.34 AS recoverable
    FROM context
)
SELECT _id, ride_id, agency_id, trip_id, vehicle_id, hashed_shape_id, node_index,
    latitude, longitude, speed, bearing, created_at, received_at,
    match_distance_m, heading_difference_degrees, match_confidence,
    if(plausible, gap_ms, gap2_ms) / 1000. AS time_gap_seconds,
    if(plausible, abs(delta) * 25. / (gap_ms / 1000.),
        abs(delta2) * 25. / (gap2_ms / 1000.)) AS progression_speed_mps,
    match_confidence * if(plausible, 1., 0.7) AS position_confidence
FROM checks
WHERE match_confidence >= 0.2 AND (plausible OR recoverable);

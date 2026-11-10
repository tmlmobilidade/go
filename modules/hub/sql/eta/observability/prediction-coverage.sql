-- Include scheduled-active pairs with missing or suppressed GPS in the denominator.
WITH latest_positions AS (
    SELECT ride_id, argMax(node_index, tuple(created_at, _id)) AS node_index
    FROM eta.valid_vehicle_events GROUP BY ride_id
), expected AS (
    SELECT r.agency_id AS agency_id, r.route_id AS route_id, r._id AS ride_id,
        w.stop_sequence AS stop_sequence
    FROM eta.curr_rides AS r FINAL
    INNER JOIN eta.curr_waypoints_snapped AS w FINAL ON w.hashed_trip_id = r.hashed_trip_id
    LEFT JOIN latest_positions AS p ON p.ride_id = r._id
    WHERE r.start_time_scheduled <= toUnixTimestamp64Milli(now64(3))
      AND r.end_time_scheduled + 4 * 3600000 >= toUnixTimestamp64Milli(now64(3))
      AND (r.end_time_observed IS NULL OR r.end_time_observed = 0)
      AND w.node_index >= coalesce(p.node_index, toUInt32(0))
), published AS (
    SELECT DISTINCT ride_id, stop_sequence FROM eta.publishable_trip_stop_etas
)
SELECT e.agency_id AS agency_id, e.route_id AS route_id,
    count() AS scheduled_active_stop_pairs, count(p.ride_id) AS published_stop_pairs,
    published_stop_pairs / scheduled_active_stop_pairs AS publication_coverage
FROM expected AS e
LEFT JOIN published AS p ON p.ride_id = e.ride_id AND p.stop_sequence = e.stop_sequence
GROUP BY e.agency_id, e.route_id
SETTINGS join_use_nulls = 1;

-- Refreshable non-APPEND views replace the entire target atomically. FINAL
-- deduplicates keys but does not implement expiry; readers need these bounds
-- even if the refreshing job stops. Every public output reads this view.
CREATE OR REPLACE VIEW eta.publishable_trip_stop_etas AS
WITH toUnixTimestamp64Milli(now64(3)) AS now_ms
SELECT
    e.ride_id AS ride_id,
    e.route_id AS route_id,
    e.operational_date AS operational_date,
    e.position_received_at AS position_received_at,
    e.trip_id AS trip_id,
    e.agency_id AS agency_id,
    e.plan_id AS plan_id,
    e.vehicle_id AS vehicle_id,
    e.hashed_trip_id AS hashed_trip_id,
    e.hashed_shape_id AS hashed_shape_id,
    e.current_node_index AS current_node_index,
    e.current_node_latitude AS current_node_latitude,
    e.current_node_longitude AS current_node_longitude,
    e.position_created_at AS position_created_at,
    e.stop_sequence AS stop_sequence,
    e.stop_id AS stop_id,
    e.stop_name AS stop_name,
    e.stop_node_index AS stop_node_index,
    e.stop_node_latitude AS stop_node_latitude,
    e.stop_node_longitude AS stop_node_longitude,
    e.eta_seconds AS eta_seconds,
    e.eta_at AS eta_at,
    e.refreshed_at AS refreshed_at,
    e.baseline_eta_at AS baseline_eta_at,
    e.prediction_version AS prediction_version,
    e.history_coverage AS history_coverage,
    e.freshness_tier AS freshness_tier,
    e.prediction_confidence AS prediction_confidence
FROM eta.pred_trip_stop_etas_v2 AS e FINAL
INNER JOIN eta.curr_rides AS r FINAL ON r._id = e.ride_id
    AND r.agency_id = e.agency_id AND r.plan_id = e.plan_id
    AND r.hashed_trip_id = e.hashed_trip_id AND r.hashed_shape_id = e.hashed_shape_id
CROSS JOIN eta.policy AS policy
WHERE e.eta_at IS NOT NULL AND e.eta_at >= now_ms - 15000
  AND e.stop_node_index >= e.current_node_index
  AND e.refreshed_at >= now_ms - policy.max_generation_age_seconds * 1000
  AND e.refreshed_at <= now_ms + policy.future_tolerance_seconds * 1000
  AND e.position_created_at >= now_ms - policy.max_gps_seconds * 1000
  AND e.position_created_at <= now_ms + policy.future_tolerance_seconds * 1000
  AND e.prediction_confidence >= policy.min_publish_confidence
  AND (r.end_time_observed IS NULL OR r.end_time_observed = 0 OR r.end_time_observed > now_ms)
  AND now_ms <= r.end_time_scheduled + 4 * 3600000;

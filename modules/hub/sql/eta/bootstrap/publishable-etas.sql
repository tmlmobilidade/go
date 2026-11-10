-- Refreshable non-APPEND views replace the entire target atomically. FINAL
-- deduplicates keys but does not implement expiry; readers need these bounds
-- even if the refreshing job stops. Every public output reads this view.
CREATE OR REPLACE VIEW eta.publishable_trip_stop_etas AS
WITH toUnixTimestamp64Milli(now64(3)) AS now_ms,
    deployment AS (SELECT * FROM eta.ml_deployment FINAL WHERE slot = 'active' AND enabled = 1),
    health AS (SELECT * FROM eta.model_health WHERE recorded_at >= now_ms - 60000
        AND model_version IN (SELECT model_version FROM deployment)
        ORDER BY recorded_at DESC LIMIT 1 BY model_version)
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
    if(ml_eligible, m.predicted_eta_at, e.eta_at) AS eta_at,
    e.refreshed_at AS refreshed_at,
    e.baseline_eta_at AS baseline_eta_at,
    if(ml_eligible, concat('ml:', m.model_version), e.prediction_version) AS prediction_version,
    e.history_coverage AS history_coverage,
    e.freshness_tier AS freshness_tier,
    e.prediction_confidence AS prediction_confidence,
    m.status = 'ok' AND m.fallback_eta_at = e.eta_at AND m.feature_schema = 'eta-features-v1'
        AND m.predicted_eta_at IS NOT NULL AND m.predicted_eta_at >= now_ms - 15000
        AND m.scored_at >= now_ms - 60000 AND m.scored_at <= now_ms + 5000
        AND h.status = 'ok' AND h.eligible_for_canary = 1
        AND h.recorded_at >= now_ms - 60000 AND h.recorded_at <= now_ms + 5000 AND h.latency_ms <= 10000
        AND h.fallback_fraction <= 0.2
        AND q.passed = 1 AND q.refreshed_at >= now_ms - 600000
        AND qh.passed = 1 AND qh.refreshed_at >= now_ms - 600000
        AND cityHash64(e.ride_id) % 10000 < least(100., greatest(0., deployment.canary_percent)) * 100.
        AS ml_eligible
FROM eta.pred_trip_stop_etas_v2 AS e FINAL
INNER JOIN eta.curr_rides AS r FINAL ON r._id = e.ride_id
    AND r.agency_id = e.agency_id AND r.plan_id = e.plan_id
    AND r.hashed_trip_id = e.hashed_trip_id AND r.hashed_shape_id = e.hashed_shape_id
CROSS JOIN eta.policy AS policy
LEFT JOIN (
    SELECT * FROM eta.model_predictions FINAL
    WHERE generated_at >= now_ms - 90000 AND model_version IN (SELECT model_version FROM deployment)
) AS m ON m.ride_id = e.ride_id AND m.vehicle_id = e.vehicle_id
    AND m.stop_sequence = e.stop_sequence AND m.generated_at = e.refreshed_at
LEFT JOIN deployment ON deployment.model_version = m.model_version
LEFT JOIN health AS h ON h.model_version = m.model_version
LEFT JOIN eta.ml_quality_gates AS q ON q.model_version = m.model_version
    AND q.agency_id = e.agency_id AND q.route_id = e.route_id AND q.horizon_minutes = 0
LEFT JOIN eta.ml_quality_gates AS qh ON qh.model_version = m.model_version
    AND qh.agency_id = e.agency_id AND qh.route_id = e.route_id
    AND qh.horizon_minutes = multiIf((m.baseline_eta_at - m.generated_at) / 1000. <= 120, 2,
        (m.baseline_eta_at - m.generated_at) / 1000. <= 300, 5,
        (m.baseline_eta_at - m.generated_at) / 1000. <= 600, 10, 20)
WHERE e.eta_at IS NOT NULL AND e.eta_at >= now_ms - 15000
  AND e.stop_node_index >= e.current_node_index
  AND e.refreshed_at >= now_ms - policy.max_generation_age_seconds * 1000
  AND e.refreshed_at <= now_ms + policy.future_tolerance_seconds * 1000
  AND e.position_created_at >= now_ms - policy.max_gps_seconds * 1000
  AND e.position_created_at <= now_ms + policy.future_tolerance_seconds * 1000
  AND e.prediction_confidence >= policy.min_publish_confidence
  AND (r.end_time_observed IS NULL OR r.end_time_observed = 0 OR r.end_time_observed > now_ms)
  AND now_ms <= r.end_time_scheduled + 4 * 3600000;

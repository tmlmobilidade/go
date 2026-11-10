-- Read the atomic current feature frame; do not scan snapshot history on serving.
SELECT
    p.ride_id AS ride_id, p.vehicle_id AS vehicle_id, p.stop_sequence AS stop_sequence,
    p.operational_date AS operational_date, p.refreshed_at AS generated_at,
    'eta-features-v1' AS feature_schema, p.prediction_version AS prediction_version,
    p.agency_id AS agency_id, p.route_id AS route_id, p.stop_id AS stop_id,
    p.hashed_shape_id AS hashed_shape_id, p.freshness_tier AS freshness_tier,
    p.historical_eta_at AS historical_eta_at, p.baseline_eta_at AS baseline_eta_at, p.eta_at AS incumbent_eta_at,
    p.traffic_eta_at AS traffic_eta_at,
    (p.baseline_eta_at - p.refreshed_at) / 1000. AS baseline_seconds,
    greatest(toInt64(0), toInt64(p.stop_node_index) - toInt64(p.current_node_index)) * 25. AS remaining_distance_m,
    toUInt16(row_number() OVER (PARTITION BY p.ride_id, p.vehicle_id ORDER BY p.stop_sequence)) AS remaining_stops, greatest(0., (p.refreshed_at - p.position_created_at) / 1000.) AS gps_age_seconds,
    greatest(0., (p.position_received_at - p.position_created_at) / 1000.) AS ingestion_lag_seconds, p.history_coverage AS history_coverage,
    p.position_confidence AS position_confidence, p.recent_speed_mps AS recent_speed_mps,
    p.node_dispersion_seconds AS node_dispersion_seconds,
    (p.baseline_eta_at - p.scheduled_arrival_at) / 1000. AS baseline_delay_seconds,
    (p.traffic_eta_at - p.baseline_eta_at) / 1000. AS traffic_correction_seconds,
    p.future_dwell_seconds AS future_dwell_seconds,
    sin(toHour(fromUnixTimestamp64Milli(p.refreshed_at, 'Europe/Lisbon')) * pi() / 12.) AS hour_sin,
    cos(toHour(fromUnixTimestamp64Milli(p.refreshed_at, 'Europe/Lisbon')) * pi() / 12.) AS hour_cos,
    toDayOfWeek(toDate(fromUnixTimestamp64Milli(p.position_created_at, 'Europe/Lisbon') - INTERVAL 4 HOUR)) AS operational_weekday
FROM eta.pred_trip_stop_etas_v2 AS p FINAL
WHERE p.refreshed_at >= toUnixTimestamp64Milli(now64(3)) - 90000 AND p.eta_at IS NOT NULL
LIMIT 50001;

-- Export as JSONEachRow. Features come ONLY from the frozen prediction row.
-- Actual arrivals are targets, never features. Bound all three clocks.
WITH snapshots AS (
    SELECT * FROM eta.prediction_snapshots
    WHERE generated_at >= {since:Int64} AND generated_at < {until:Int64}
      AND feature_schema = 'eta-features-v1'
    ORDER BY captured_at DESC
    LIMIT 1 BY ride_id, vehicle_id, stop_sequence, generated_at, prediction_version
)
SELECT
    p.ride_id AS ride_id, p.vehicle_id AS vehicle_id, p.stop_sequence AS stop_sequence,
    p.operational_date AS operational_date, p.generated_at AS generated_at,
    p.feature_schema AS feature_schema, p.prediction_version AS prediction_version,
    p.agency_id AS agency_id, p.route_id AS route_id, p.stop_id AS stop_id,
    p.hashed_shape_id AS hashed_shape_id, p.freshness_tier AS freshness_tier,
    p.historical_eta_at AS historical_eta_at, p.baseline_eta_at AS baseline_eta_at, p.eta_at AS incumbent_eta_at,
    p.traffic_eta_at AS traffic_eta_at,
    (p.baseline_eta_at - p.generated_at) / 1000. AS baseline_seconds,
    greatest(toInt64(0), toInt64(p.stop_node_index) - toInt64(p.current_node_index)) * 25. AS remaining_distance_m,
    p.remaining_stops AS remaining_stops, p.gps_age_seconds AS gps_age_seconds,
    p.ingestion_lag_seconds AS ingestion_lag_seconds, p.history_coverage AS history_coverage,
    p.position_confidence AS position_confidence, p.recent_speed_mps AS recent_speed_mps,
    p.node_dispersion_seconds AS node_dispersion_seconds,
    (p.baseline_eta_at - p.scheduled_arrival_at) / 1000. AS baseline_delay_seconds,
    (p.traffic_eta_at - p.baseline_eta_at) / 1000. AS traffic_correction_seconds,
    p.future_dwell_seconds AS future_dwell_seconds,
    sin(toHour(fromUnixTimestamp64Milli(p.generated_at, 'Europe/Lisbon')) * pi() / 12.) AS hour_sin,
    cos(toHour(fromUnixTimestamp64Milli(p.generated_at, 'Europe/Lisbon')) * pi() / 12.) AS hour_cos,
    toDayOfWeek(toDate(fromUnixTimestamp64Milli(p.position_created_at, 'Europe/Lisbon') - INTERVAL 4 HOUR)) AS operational_weekday,
    a.arrival_at AS actual_arrival_at, a.known_at AS label_known_at,
    a.confidence AS label_confidence,
    if(a.arrival_at > p.generated_at AND a.confidence >= 0.7 AND a.known_at <= {as_of:Int64},
       (a.arrival_at - p.baseline_eta_at) / 1000., NULL) AS target_residual_seconds
FROM snapshots AS p
LEFT JOIN eta.actual_arrivals AS a FINAL ON a.ride_id = p.ride_id
    AND a.vehicle_id = p.vehicle_id AND a.stop_sequence = p.stop_sequence AND a.label_version = 1
SETTINGS join_use_nulls = 1;

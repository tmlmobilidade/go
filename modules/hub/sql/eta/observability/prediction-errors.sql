SELECT
    agency_id, route_id, prediction_version,
    multiIf(horizon_seconds <= 120, 2, horizon_seconds <= 300, 5,
            horizon_seconds <= 600, 10, horizon_seconds <= 1200, 20, 99) AS horizon_minutes,
    toHour(fromUnixTimestamp64Milli(generated_at, 'Europe/Lisbon')) AS local_hour,
    count() AS eligible_predictions,
    countIf(has_label) / count() AS label_coverage,
    countIf(eta_at IS NOT NULL) / count() AS prediction_coverage,
    count(signed_error_seconds) AS scored_predictions,
    avg(abs(signed_error_seconds)) AS mae_seconds,
    quantiles(0.5, 0.9)(abs(signed_error_seconds)) AS median_p90_seconds,
    avg(signed_error_seconds) AS signed_bias_seconds,
    countIf(abs(signed_error_seconds) <= 60) / nullIf(count(signed_error_seconds), 0) AS within_60s,
    countIf(abs(signed_error_seconds) <= 120) / nullIf(count(signed_error_seconds), 0) AS within_120s
FROM eta.prediction_errors
WHERE generated_at >= {since:Int64} AND generated_at < {until:Int64}
  AND horizon_seconds >= 0
GROUP BY agency_id, route_id, prediction_version, horizon_minutes, local_hour;

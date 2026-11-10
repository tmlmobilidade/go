-- Generation, GPS and receive clocks are independent. One query for a dashboard.
SELECT
    agency_id, prediction_version,
    count() AS predictions,
    countIf(eta_at IS NULL) / count() AS suppressed_fraction,
    quantiles(0.5, 0.9, 0.99)(gps_age_seconds) AS gps_age_quantiles_seconds,
    quantiles(0.5, 0.9, 0.99)(ingestion_lag_seconds) AS ingestion_lag_quantiles_seconds,
    avg(history_coverage) AS mean_history_coverage,
    max(generated_at) AS last_generation_at
FROM eta.prediction_snapshots
WHERE generated_at >= toUnixTimestamp64Milli(now64(3)) - 3600000
GROUP BY agency_id, prediction_version;

SELECT model_version, mode, status, count() AS batches,
    quantiles(0.5, 0.9, 0.99)(latency_ms) AS latency_ms,
    avg(fallback_fraction) AS fallback_fraction,
    avg(missing_feature_fraction) AS missing_feature_fraction,
    max(recorded_at) AS last_batch_at, max(generated_at) AS last_generation_at
FROM eta.model_health
WHERE recorded_at >= toUnixTimestamp64Milli(now64(3)) - 3600000
GROUP BY model_version, mode, status;

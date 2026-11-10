-- Explicit configuration, preserved on bootstrap reruns. Values are seconds
-- unless the key ends in confidence. Change with a newer updated_at version.
CREATE TABLE IF NOT EXISTS eta.runtime_policy
(
    key String, value Float64, updated_at Int64
)
ENGINE = ReplacingMergeTree(updated_at)
ORDER BY key;

INSERT INTO eta.runtime_policy
SELECT key, value, toUnixTimestamp64Milli(now64(3))
FROM values('key String, value Float64',
    ('fresh_gps_seconds', 60), ('max_gps_seconds', 180),
    ('max_ingestion_lag_seconds', 120), ('future_tolerance_seconds', 5),
    ('max_extrapolation_seconds', 30), ('min_publish_confidence', 0.15),
    ('max_generation_age_seconds', 90))
WHERE key NOT IN (SELECT key FROM eta.runtime_policy FINAL);

CREATE OR REPLACE VIEW eta.policy AS
SELECT
    least(120., greatest(1., maxIf(value, key = 'fresh_gps_seconds'))) AS fresh_gps_seconds,
    least(300., greatest(30., maxIf(value, key = 'max_gps_seconds'))) AS max_gps_seconds,
    least(300., greatest(1., maxIf(value, key = 'max_ingestion_lag_seconds'))) AS max_ingestion_lag_seconds,
    least(30., greatest(0., maxIf(value, key = 'future_tolerance_seconds'))) AS future_tolerance_seconds,
    least(30., greatest(0., maxIf(value, key = 'max_extrapolation_seconds'))) AS max_extrapolation_seconds,
    least(1., greatest(0., maxIf(value, key = 'min_publish_confidence'))) AS min_publish_confidence,
    least(120., greatest(30., maxIf(value, key = 'max_generation_age_seconds'))) AS max_generation_age_seconds
FROM eta.runtime_policy FINAL;

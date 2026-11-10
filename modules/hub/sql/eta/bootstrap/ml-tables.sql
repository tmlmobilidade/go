CREATE TABLE IF NOT EXISTS eta.model_predictions
(
    generated_at Int64, scored_at Int64, ride_id String, vehicle_id String,
    stop_sequence UInt16, agency_id String, route_id String,
    baseline_eta_at Int64, fallback_eta_at Int64, predicted_eta_at Nullable(Int64),
    model_version String, feature_schema String, status LowCardinality(String),
    missing_feature_fraction Float64
)
ENGINE = ReplacingMergeTree(scored_at)
PARTITION BY toYYYYMMDD(fromUnixTimestamp64Milli(generated_at, 'UTC'))
ORDER BY (generated_at, model_version, ride_id, vehicle_id, stop_sequence)
TTL fromUnixTimestamp64Milli(generated_at, 'UTC') + INTERVAL 35 DAY;

CREATE TABLE IF NOT EXISTS eta.model_health
(
    model_version String, recorded_at Int64, generated_at Int64,
    status LowCardinality(String), mode LowCardinality(String),
    rows UInt32, latency_ms Float64, fallback_fraction Float64,
    missing_feature_fraction Float64, eligible_for_canary UInt8
)
ENGINE = MergeTree ORDER BY (model_version, recorded_at)
TTL fromUnixTimestamp64Milli(recorded_at, 'UTC') + INTERVAL 35 DAY;

-- Empty by default: shadow writes never activate passenger publication.
CREATE TABLE IF NOT EXISTS eta.ml_deployment
(
    slot String, model_version String, enabled UInt8, canary_percent Float64,
    updated_at Int64
)
ENGINE = ReplacingMergeTree(updated_at) ORDER BY slot;

CREATE TABLE IF NOT EXISTS eta.ml_quality_gates
(
    model_version String, agency_id String, route_id String, horizon_minutes UInt8,
    samples UInt32, independent_rides UInt32, coverage Float64,
    baseline_mae Float64, model_mae Float64, baseline_p90 Float64, model_p90 Float64,
    passed UInt8, refreshed_at Int64
)
ENGINE = MergeTree ORDER BY (model_version, agency_id, route_id, horizon_minutes);

-- Append history AFTER a successful atomic prediction refresh. Never sample a
-- half-built generation. Replays are deduplicated by generation in readers.
CREATE TABLE IF NOT EXISTS eta.prediction_snapshots
(
    generated_at Int64,
    captured_at Int64,
    position_created_at Int64,
    position_received_at Int64,
    ride_id String,
    operational_date UInt32,
    trip_id String,
    agency_id LowCardinality(String),
    route_id String,
    plan_id String,
    vehicle_id String,
    hashed_trip_id String,
    hashed_shape_id String,
    stop_sequence UInt16,
    stop_id String,
    current_node_index UInt32,
    stop_node_index UInt32,
    baseline_eta_at Nullable(Int64),
    eta_at Nullable(Int64),
    prediction_version LowCardinality(String),
    history_coverage Float64,
    horizon_seconds Int32,
    gps_age_seconds Float64,
    ingestion_lag_seconds Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(fromUnixTimestamp64Milli(generated_at, 'UTC'))
ORDER BY (agency_id, ride_id, vehicle_id, stop_sequence, generated_at, prediction_version)
TTL fromUnixTimestamp64Milli(generated_at, 'UTC') + INTERVAL 35 DAY;

ALTER TABLE eta.prediction_snapshots
    ADD COLUMN IF NOT EXISTS freshness_tier LowCardinality(String) DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS prediction_confidence Float64 DEFAULT 0;

CREATE OR REPLACE MATERIALIZED VIEW eta.mv_prediction_snapshots
REFRESH EVERY 30 SECOND DEPENDS ON eta.mv_pred_trip_stop_etas
APPEND TO eta.prediction_snapshots AS
SELECT
    refreshed_at AS generated_at,
    toUnixTimestamp64Milli(now64(3)) AS captured_at,
    position_created_at,
    position_received_at,
    ride_id, operational_date, trip_id, agency_id, route_id, plan_id, vehicle_id,
    hashed_trip_id, hashed_shape_id, stop_sequence, stop_id,
    current_node_index, stop_node_index, baseline_eta_at, eta_at,
    prediction_version, history_coverage, freshness_tier, prediction_confidence,
    toInt32(ifNull((eta_at - refreshed_at) / 1000, -1)) AS horizon_seconds,
    greatest(0., (refreshed_at - position_created_at) / 1000.) AS gps_age_seconds,
    greatest(0., (position_received_at - position_created_at) / 1000.) AS ingestion_lag_seconds
FROM eta.pred_trip_stop_etas FINAL;

-- This records an actual publisher read, separate from generation/capture.
-- A failed cache write is not a publication. Call only after successful writes.
CREATE TABLE IF NOT EXISTS eta.publication_runs
(
    published_at Int64,
    agency_id LowCardinality(String),
    format LowCardinality(String),
    -- A run marker, not proof that every generation in this time window was read.
    succeeded UInt8 DEFAULT 1
)
ENGINE = MergeTree
ORDER BY (agency_id, published_at, format)
TTL fromUnixTimestamp64Milli(published_at, 'UTC') + INTERVAL 35 DAY;

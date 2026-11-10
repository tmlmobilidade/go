CREATE TABLE IF NOT EXISTS eta.bias_calibration
(
    source LowCardinality(String), scope LowCardinality(String),
    agency_id String, route_id String, local_period UInt8, horizon_minutes UInt8,
    bias_seconds Float64, independent_rides UInt32, effective_support Float64,
    last_arrival_at Int64, refreshed_at Int64
)
ENGINE = MergeTree ORDER BY (source, scope, agency_id, route_id, local_period, horizon_minutes);


CREATE OR REPLACE VIEW eta.current_bias_calibration AS
SELECT source, scope, agency_id, route_id, local_period, horizon_minutes,
    bias_seconds * exp(-greatest(0., (toUnixTimestamp64Milli(now64(3)) - refreshed_at) / 1000.) / 21600.) AS bias_seconds,
    independent_rides, effective_support
FROM eta.bias_calibration
WHERE refreshed_at >= toUnixTimestamp64Milli(now64(3)) - 120000
  AND effective_support >= multiIf(scope = 'route', 5., scope = 'agency', 10., 30.);

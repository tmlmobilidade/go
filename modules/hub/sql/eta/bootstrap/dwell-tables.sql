CREATE TABLE IF NOT EXISTS eta.stop_dwell_labels
(
    ride_id String, vehicle_id String, stop_sequence UInt16,
    hashed_trip_id String, hashed_shape_id String, stop_id String, node_index UInt32,
    arrival_at Int64, departure_at Nullable(Int64), dwell_seconds Nullable(Float64),
    source LowCardinality(String), confidence Float64, status LowCardinality(String), known_at Int64
)
ENGINE = ReplacingMergeTree(known_at)
ORDER BY (ride_id, vehicle_id, stop_sequence)
TTL fromUnixTimestamp64Milli(known_at, 'UTC') + INTERVAL 35 DAY;

CREATE TABLE IF NOT EXISTS eta.stop_dwell_model
(
    hashed_trip_id String, stop_sequence UInt16, period_of_day String,
    median_seconds Float64, p90_seconds Float64, independent_rides UInt32, refreshed_at Int64
)
ENGINE = MergeTree ORDER BY (hashed_trip_id, stop_sequence, period_of_day);

CREATE OR REPLACE VIEW eta.current_stop_dwell AS
SELECT hashed_trip_id, stop_sequence, period_of_day,
    least(180., greatest(0., median_seconds)) * independent_rides / (independent_rides + 5.) AS seconds,
    p90_seconds, independent_rides
FROM eta.stop_dwell_model
WHERE independent_rides >= 5 AND refreshed_at >= toUnixTimestamp64Milli(now64(3)) - 1800000;

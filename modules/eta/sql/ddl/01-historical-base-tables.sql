-- Base tables for transformation + aggregation pipelines (historical path).

CREATE DATABASE IF NOT EXISTS eta;

CREATE TABLE IF NOT EXISTS eta.vehicle_events
(
    _id String,
    created_at UInt64,
    agency_id String,
    ride_id String,
    hashed_shape_id String,
    line_id UInt16,
    latitude Float64,
    longitude Float64,
    vehicle_id String
)
ENGINE = MergeTree()
ORDER BY (ride_id, hashed_shape_id, created_at);

CREATE TABLE IF NOT EXISTS eta.shape_nodes
(
    shape_id String,
    node_index UInt32,
    latitude Float64,
    longitude Float64
)
ENGINE = MergeTree()
ORDER BY (shape_id, node_index);

CREATE TABLE IF NOT EXISTS eta.node_travel_times_samples
(
    event_id String,
    ride_id String,
    hashed_shape_id String,
    node_index UInt32,
    hour UInt8,
    created_at UInt64,
    travel_time_seconds UInt32,
    speed_kmh Float64,
    latitude Float64,
    longitude Float64
)
ENGINE = MergeTree()
ORDER BY (ride_id, hashed_shape_id, node_index, hour);

CREATE TABLE IF NOT EXISTS eta.node_travel_times_aggregates
(
    shape_id String,
    node_index UInt32,
    operational_date UInt32,
    period String,
    period_of_day Enum8('Peak AM' = 1, 'Mid' = 2, 'Peak PM' = 3, 'Off Peak' = 4),
    weekday Enum8('Monday' = 1, 'Tuesday' = 2, 'Wednesday' = 3, 'Thursday' = 4, 'Friday' = 5, 'Saturday' = 6, 'Sunday' = 7),
    day_type Enum8('Weekday' = 1, 'Weekend' = 2),
    avg_travel_time_seconds Float64,
    min_travel_time_seconds Float64,
    max_travel_time_seconds Float64,
    median_travel_time_seconds Float64
)
ENGINE = MergeTree()
ORDER BY
(
    shape_id,
    node_index,
    operational_date,
    period,
    period_of_day,
    weekday,
    day_type
);

CREATE DATABASE IF NOT EXISTS {database};

-- =============================================================================
-- Ride sets (Mongo → ClickHouse via loader)
-- =============================================================================

-- Historical window: rides whose samples feed transformation / aggregation.
CREATE TABLE IF NOT EXISTS {database}.hist_rides (
    _id String,
    hashed_shape_id String,
    hashed_trip_id String,
    trip_id String,
    start_time_observed UInt64,
    start_time_scheduled UInt64,
    end_time_observed UInt64
)
ENGINE = ReplacingMergeTree()
ORDER BY (_id);

-- Current service window (same schema as hist_rides; used for live / near-term slices).
CREATE TABLE IF NOT EXISTS {database}.curr_rides (
    _id String,
    hashed_shape_id String,
    hashed_trip_id String,
    trip_id String,
    start_time_observed UInt64,
    start_time_scheduled UInt64,
    end_time_observed UInt64
)
ENGINE = ReplacingMergeTree()
ORDER BY (_id);

-- =============================================================================
-- Events & geometry
-- =============================================================================

CREATE TABLE IF NOT EXISTS {database}.hist_vehicle_events (
    _id String,
    created_at UInt64,
    agency_id String,
    ride_id String,
    trip_id String,
    hashed_shape_id String,
    latitude Float64,
    longitude Float64,
    vehicle_id String
)
ENGINE = ReplacingMergeTree()
ORDER BY (trip_id, ride_id, hashed_shape_id, created_at);

CREATE TABLE IF NOT EXISTS {database}.hist_shape_nodes (
    hashed_shape_id String,
    node_index UInt32,
    latitude Float64,
    longitude Float64,
    geohash String,
    INDEX idx_geohash geohash TYPE bloom_filter GRANULARITY 1
)
ENGINE = ReplacingMergeTree()
ORDER BY (geohash, hashed_shape_id, node_index);

ALTER TABLE {database}.hist_shape_nodes
    MATERIALIZE INDEX idx_geohash;

-- =============================================================================
-- Node travel times transformation outputs
-- =============================================================================

CREATE TABLE IF NOT EXISTS {database}.hist_node_travel_times (
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
ENGINE = ReplacingMergeTree()
ORDER BY (ride_id, hashed_shape_id, node_index, hour);

DROP TABLE IF EXISTS {database}.hist_node_travel_times_aggregation;

-- The loader (3-aggregate_hist_node_travel_times.sql) re-aggregates the last
-- N days on every run, so identical (hashed_shape_id, node_index,
-- operational_date, period, period_of_day, weekday, day_type) rows would
-- otherwise pile up and skew the averages computed by mv-predict-node-etas.sql.
--
-- ReplacingMergeTree with `inserted_at` as the version keeps the latest row
-- per ORDER BY key. Readers MUST use `FINAL` (or the equivalent setting) to
-- get deduplicated results, because background merges run asynchronously.
CREATE TABLE IF NOT EXISTS {database}.hist_node_travel_times_aggregation (
    hashed_shape_id String,
    node_index UInt32,
    operational_date UInt32,
    period String,
    period_of_day Enum8('Peak AM' = 1, 'Mid' = 2, 'Peak PM' = 3, 'Off Peak' = 4),
    weekday Enum8('Monday' = 1, 'Tuesday' = 2, 'Wednesday' = 3, 'Thursday' = 4, 'Friday' = 5, 'Saturday' = 6, 'Sunday' = 7),
    day_type Enum8('Weekday' = 1, 'Weekend' = 2),
    avg_travel_time_seconds Float64,
    min_travel_time_seconds Float64,
    max_travel_time_seconds Float64,
    median_travel_time_seconds Float64,
    inserted_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(inserted_at)
ORDER BY
    (hashed_shape_id, node_index, operational_date, period, period_of_day, weekday, day_type);


-- =============================================================================
-- Waypoints
-- =============================================================================

CREATE TABLE IF NOT EXISTS {database}.curr_waypoints
(
    arrival_time String,
    departure_time String,
    drop_off_type UInt8,
    hashed_trip_id String,
    pickup_type UInt8,
    shape_dist_traveled Float64,
    stop_id String,
    stop_lat Float64,
    stop_lon Float64,
    stop_name String,
    stop_sequence UInt16,
    timepoint UInt8
)
ENGINE = ReplacingMergeTree()
ORDER BY (hashed_trip_id, stop_sequence, stop_id);

-- Snapped waypoints: every stop on a trip resolved to its nearest shape node.
CREATE TABLE IF NOT EXISTS {database}.curr_waypoints_snapped
(
    hashed_trip_id String,
    hashed_shape_id String,
    stop_sequence UInt16,
    stop_id String,
    stop_name String,
    stop_lat Float64,
    stop_lon Float64,
    node_index UInt32,
    arrival_time String,
    departure_time String
)
ENGINE = ReplacingMergeTree()
ORDER BY (hashed_trip_id, stop_sequence, stop_id);
TRUNCATE DATABASE eta;

-- ========================
-- Historical Rides
-- ========================

CREATE TABLE IF NOT EXISTS eta.hist_rides
AS operation.rides;

-- Shape geometry is NOT stored per ride: eta.hist_shape_nodes is built straight
-- from operation.hashed_shapes for the shapes referenced here.
ALTER TABLE eta.hist_rides
ADD COLUMN first_stop_id String,
ADD COLUMN first_stop_name String,
ADD COLUMN first_stop_coordinates Tuple(Float64, Float64),
ADD COLUMN first_stop_geohash String DEFAULT geohashEncode(first_stop_coordinates.2, first_stop_coordinates.1, 7),
ADD COLUMN last_stop_id String,
ADD COLUMN last_stop_name String,
ADD COLUMN last_stop_coordinates Tuple(Float64, Float64),
ADD COLUMN last_stop_geohash String DEFAULT geohashEncode(last_stop_coordinates.2, last_stop_coordinates.1, 7),
ADD COLUMN analysis_expected_vehicle_event_coverage_geo_grade Nullable(String);

-- ========================
-- Current Rides
-- ========================
CREATE TABLE IF NOT EXISTS eta.curr_rides
AS eta.hist_rides;

-- ========================
-- Historical Vehicle Events
-- ========================
CREATE TABLE IF NOT EXISTS eta.hist_vehicle_events
AS operation.simplified_vehicle_events;

ALTER TABLE eta.hist_vehicle_events
ADD COLUMN ride_id String,
ADD COLUMN hashed_shape_id String;

-- Rows age out with the historical window instead of being deleted by mutation.
ALTER TABLE eta.hist_vehicle_events
MODIFY TTL toDateTime(intDiv(created_at, 1000), 'UTC') + INTERVAL 35 DAY;

-- ========================
-- Historical Shape Nodes
-- ========================
CREATE TABLE IF NOT EXISTS eta.hist_shape_nodes (
    hashed_shape_id String,
    node_index UInt32,
    latitude Float64,
    longitude Float64,
    geohash String,
    INDEX idx_geohash geohash TYPE bloom_filter GRANULARITY 1,
)
ENGINE = ReplacingMergeTree()
ORDER BY (geohash, hashed_shape_id, node_index);

-- =============================================================================
-- Node travel times transformation outputs
-- =============================================================================

-- One row per (ride, shape node) traversal. Written by
-- loader/build-hist-node-travel-times.sql one UTC day at a time; the day is the
-- unit of idempotency (the loader drops the partition before rebuilding it), so
-- a plain MergeTree is enough and no FINAL is needed on reads.
--
-- ORDER BY matches the aggregation's GROUP BY; PARTITION BY matches both the
-- loader's UTC-day chunks and the aggregation's created_at scan window, so each
-- daily aggregation reads ~1/30 of the table instead of all of it.
CREATE TABLE IF NOT EXISTS eta.hist_node_travel_times (
    ride_id String,
    hashed_shape_id LowCardinality(String),
    node_index UInt32,
    created_at Int64 CODEC(DoubleDelta, ZSTD(1)),
    travel_time_seconds Float32
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(toDateTime(intDiv(created_at, 1000), 'UTC'))
ORDER BY (hashed_shape_id, node_index, created_at)
TTL toDateTime(intDiv(created_at, 1000), 'UTC') + INTERVAL 35 DAY;


CREATE TABLE IF NOT EXISTS eta.hist_node_travel_times_aggregation (
    hashed_shape_id String,
    node_index UInt32,
    operational_date UInt32,
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
    (hashed_shape_id, node_index, operational_date, period_of_day, weekday, day_type);

-- ========================
-- Current Waypoints
-- ========================

CREATE TABLE IF NOT EXISTS eta.curr_waypoints
as operation.hashed_trips;

-- Snapped waypoints: every stop on a trip resolved to its nearest shape node.
CREATE TABLE IF NOT EXISTS eta.curr_waypoints_snapped
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
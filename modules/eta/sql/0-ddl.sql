-- ! For development only: truncate tables manually when needed
-- TRUNCATE TABLE eta.hist_vehicle_events;
-- TRUNCATE TABLE eta.hist_rides;
-- TRUNCATE TABLE eta.curr_rides;
-- TRUNCATE TABLE eta.hist_shape_nodes;
-- TRUNCATE TABLE eta.hist_node_travel_times;

-- Historical Tables

-- List of rides the historical pipeline must process. Loader truncates + bulk-inserts
-- this set at the start of every historical run; mv_hist_node_travel_times_samples
-- joins against it to filter raw events.
CREATE TABLE IF NOT EXISTS eta.hist_rides (
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

-- List of rides the historical pipeline must process. Loader truncates + bulk-inserts
-- this set at the start of every historical run; mv_hist_node_travel_times_samples
-- joins against it to filter raw events.
CREATE TABLE IF NOT EXISTS eta.curr_rides (
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


CREATE TABLE IF NOT EXISTS eta.hist_vehicle_events (
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

CREATE TABLE IF NOT EXISTS eta.hist_shape_nodes (
    hashed_shape_id String,
    node_index UInt32,
    latitude Float64,
    longitude Float64,
    geohash String,
    INDEX idx_geohash geohash TYPE bloom_filter GRANULARITY 1
)
ENGINE = ReplacingMergeTree()
ORDER BY (geohash, hashed_shape_id, node_index);

ALTER TABLE eta.hist_shape_nodes
    MATERIALIZE INDEX idx_geohash;

CREATE TABLE IF NOT EXISTS eta.hist_node_travel_times (
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

CREATE TABLE IF NOT EXISTS eta.hist_node_travel_times_aggregation (
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
    median_travel_time_seconds Float64
)
ENGINE = MergeTree()
ORDER BY
( hashed_shape_id, node_index, operational_date, period, period_of_day, weekday, day_type);

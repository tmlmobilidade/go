-- Daily ingest tables. Snapped waypoints filled by pipeline/3-snap-waypoints-pipeline.sql.

CREATE TABLE IF NOT EXISTS eta.daily_rides
(
    _id String,
    end_time_scheduled UInt64,
    hashed_shape_id String,
    hashed_trip_id String,
    headsign String,
    line_id UInt16,
    operational_date String,
    start_time_observed UInt64,
    start_time_scheduled UInt64,
    trip_id String,
)
ENGINE = ReplacingMergeTree()
ORDER BY (_id);

CREATE TABLE IF NOT EXISTS eta.daily_rides_waypoints
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
    timepoint UInt8,
)
ENGINE = MergeTree()
ORDER BY (hashed_trip_id, stop_sequence);

-- Snapped waypoints: every stop on a trip resolved to its nearest shape node.
CREATE TABLE IF NOT EXISTS eta.daily_rides_waypoints_snapped
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
ORDER BY (hashed_trip_id, stop_sequence);

-- One-off migration for databases bootstrapped before the September 2026
-- ETA app fixes (branch feat/eta-loader-p0). Run once with
-- queryEachStatementFromFile, then re-run the three mv-*.sql files so the
-- views pick up their new definitions.
--
-- Everything indexed by node_index is invalid until eta.hist_shape_nodes is
-- rebuilt with the corrected densification, hence the truncates.

ALTER TABLE eta.hist_rides DROP COLUMN IF EXISTS shape_polyline;

ALTER TABLE eta.curr_rides DROP COLUMN IF EXISTS shape_polyline;

ALTER TABLE eta.hist_vehicle_events
MODIFY TTL toDateTime(intDiv(created_at, 1000), 'UTC') + INTERVAL 35 DAY;

DROP TABLE IF EXISTS eta.hist_node_travel_times;

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

TRUNCATE TABLE eta.hist_shape_nodes;

TRUNCATE TABLE eta.hist_node_travel_times_aggregation;

TRUNCATE TABLE eta.pred_node_etas;

TRUNCATE TABLE eta.pred_trip_stop_etas;

TRUNCATE TABLE eta.curr_waypoints;

TRUNCATE TABLE eta.curr_waypoints_snapped;

TRUNCATE TABLE eta.curr_vehicle_events;

ALTER TABLE eta.curr_vehicle_events
MODIFY TTL toDateTime(intDiv(created_at, 1000), 'UTC') + INTERVAL 2 HOUR;

-- The cleaner's keep-list staging table is no longer used.
DROP TABLE IF EXISTS eta._cleaner_hist_rides_keep;

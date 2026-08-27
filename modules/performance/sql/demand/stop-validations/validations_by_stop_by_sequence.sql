CREATE OR REPLACE TABLE performance.validations_by_stop_by_sequence (
    trip_id String,
    pattern_id String,
    stop_id String,
    stop_sequence UInt64,
    validations UInt64
)
ENGINE = ReplacingMergeTree()
ORDER BY (pattern_id, trip_id, stop_id, stop_sequence);

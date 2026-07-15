CREATE OR REPLACE TABLE performance.validations_by_stop_by_sequence (
    trip_id String,
    pattern_id String,
    stop_id String,
    validations UInt64
)
ENGINE = ReplacingMergeTree()
ORDER BY (pattern_id, trip_id, stop_id);

INSERT INTO performance.validations_by_stop_by_sequence
SELECT
    assumeNotNull(trip_id) AS trip_id,
    assumeNotNull(pattern_id) AS pattern_id,
    assumeNotNull(stop_id) AS stop_id,
    count() AS validations
FROM simplified_apex.validations
WHERE
    pattern_id IS NOT NULL
    AND trip_id IS NOT NULL
    AND stop_id IS NOT NULL
GROUP BY
    pattern_id,
    trip_id,
    stop_id;
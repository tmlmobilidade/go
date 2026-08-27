-- VALIDATIONS BY STOP BY SEQUENCE
--
-- Aggregates simplified_apex.validations by (pattern_id, trip_id, stop_id) and
-- enriches each row with stop_sequence from operation.hashed_patterns.path.
-- Uses hashed_patterns (one doc per pattern) instead of hashed_trips (~625k docs)
-- because a full JSON ARRAY JOIN on hashed_trips exceeds the query memory limit.

CREATE TABLE IF NOT EXISTS performance.validations_by_stop_by_sequence
(
    trip_id String,
    pattern_id String,
    stop_id String,
    stop_sequence UInt64,
    validations UInt64
)
ENGINE = ReplacingMergeTree()
ORDER BY (pattern_id, trip_id, stop_id, stop_sequence);

DROP VIEW IF EXISTS performance.mv_validations_by_stop_by_sequence;

CREATE MATERIALIZED VIEW performance.mv_validations_by_stop_by_sequence
REFRESH EVERY 1 DAY
TO performance.validations_by_stop_by_sequence
AS
WITH
    stop_sequences AS
    (
        SELECT
            hp.pattern_id,
            JSONExtractString(waypoint, 'stop_id') AS stop_id,
            JSONExtractUInt(waypoint, 'stop_sequence') AS stop_sequence
        FROM operation.hashed_patterns AS hp
        ARRAY JOIN JSONExtractArrayRaw(assumeNotNull(hp.path)) AS waypoint
    ),
    stop_sequence_lookup AS
    (
        SELECT
            pattern_id,
            stop_id,
            any(stop_sequence) AS stop_sequence
        FROM stop_sequences
        GROUP BY
            pattern_id,
            stop_id
    ),
    validations_by_stop AS
    (
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
            stop_id
    )
SELECT
    v.trip_id,
    v.pattern_id,
    v.stop_id,
    s.stop_sequence,
    v.validations
FROM validations_by_stop AS v
INNER JOIN stop_sequence_lookup AS s
    ON v.pattern_id = s.pattern_id
   AND v.stop_id = s.stop_id
SETTINGS max_memory_usage = 10000000000;
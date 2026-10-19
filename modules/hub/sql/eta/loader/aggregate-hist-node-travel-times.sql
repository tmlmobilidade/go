-- =============================================================================
-- Aggregates travel time statistics per shape, node, and calendar/time segment.
-- Source: eta.hist_node_travel_times
-- Target: eta.hist_node_travel_times_aggregation
--
-- Processes ONE operational day per run ($chunk_date). The loader calls this for
-- every operational day touched by the UTC-day partitions it just rebuilt, so
-- the aggregation state stays bounded to a single day's groups.
--
-- $scan_start/$scan_end (ms epoch) bound the created_at scan generously around
-- the operational day; the source table is partitioned by UTC day of created_at
-- so this prunes to 2-3 partitions. The exact row selection is done by the
-- operational_date = $chunk_date filter, so chunk boundaries can never split an
-- aggregation group.
--
-- All wall-clock derivations use Europe/Lisbon (the server runs in UTC):
--   - operational_date : service date, events before 04:00 local belong to the previous day
--   - period_of_day    : time-of-day bucket based on the local event hour
--   - weekday/day_type : from the operational date
--
-- The target is ReplacingMergeTree(inserted_at) keyed by the group columns, so
-- re-aggregating a day supersedes the previous rows (readers use FINAL).
-- =============================================================================

INSERT INTO eta.hist_node_travel_times_aggregation (
    hashed_shape_id,
    node_index,
    operational_date,
    period_of_day,
    weekday,
    day_type,
    avg_travel_time_seconds,
    min_travel_time_seconds,
    max_travel_time_seconds,
    median_travel_time_seconds,
    inserted_at
)
WITH

parsed_timestamps AS (
    SELECT
        hashed_shape_id,
        node_index,
        travel_time_seconds,
        fromUnixTimestamp64Milli(created_at, 'Europe/Lisbon') AS event_ts,
        if(
            toHour(fromUnixTimestamp64Milli(created_at, 'Europe/Lisbon')) < 4,
            fromUnixTimestamp64Milli(created_at, 'Europe/Lisbon') - INTERVAL 1 DAY,
            fromUnixTimestamp64Milli(created_at, 'Europe/Lisbon')
        ) AS operational_ts
    FROM eta.hist_node_travel_times
    WHERE
        travel_time_seconds > 0
        AND created_at >= $scan_start
        AND created_at < $scan_end
),

derived_fields AS (
    SELECT
        hashed_shape_id,
        node_index,
        travel_time_seconds,
        toUInt32(formatDateTime(operational_ts, '%Y%m%d')) AS operational_date,
        toHour(event_ts)             AS event_hour,
        toDayOfWeek(operational_ts)  AS operational_weekday -- 1=Mon … 7=Sun
    FROM parsed_timestamps
    WHERE toUInt32(formatDateTime(operational_ts, '%Y%m%d')) = $chunk_date
),

classified AS (
    SELECT
        hashed_shape_id,
        node_index,
        operational_date,
        travel_time_seconds,

        multiIf(
            event_hour BETWEEN 7  AND 9,  'Peak AM',
            event_hour BETWEEN 10 AND 16, 'Mid',
            event_hour BETWEEN 17 AND 19, 'Peak PM',
            'Off Peak'
        ) AS period_of_day,

        multiIf(
            operational_weekday = 1, 'Monday',
            operational_weekday = 2, 'Tuesday',
            operational_weekday = 3, 'Wednesday',
            operational_weekday = 4, 'Thursday',
            operational_weekday = 5, 'Friday',
            operational_weekday = 6, 'Saturday',
            'Sunday'
        ) AS weekday,

        if(operational_weekday BETWEEN 1 AND 5, 'Weekday', 'Weekend') AS day_type

    FROM derived_fields
)

-- No rounding: per-node samples are a few seconds, so integer medians would
-- carry a 30%+ quantization error that compounds over hundreds of nodes.
SELECT
    hashed_shape_id,
    node_index,
    operational_date,
    period_of_day,
    weekday,
    day_type,
    avg(travel_time_seconds)           AS avg_travel_time_seconds,
    min(travel_time_seconds)           AS min_travel_time_seconds,
    max(travel_time_seconds)           AS max_travel_time_seconds,
    quantile(0.5)(travel_time_seconds) AS median_travel_time_seconds,
    now()                              AS inserted_at
FROM classified
GROUP BY
    hashed_shape_id,
    node_index,
    operational_date,
    period_of_day,
    weekday,
    day_type;

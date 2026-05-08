-- =============================================================================
-- Aggregates travel time statistics per shape, node, and calendar/time segment.
-- Source: node_travel_times_samples
-- Target: node_travel_times_aggregates
--
-- Dimensions produced:
--   - operational_date : service date (pre-4h events shifted to previous day)
--   - period                    : school-year calendar bucket (Summer / School / Christmas)
--   - period_of_day             : time-of-day bucket based on event hour
--   - weekday                   : day name
--   - day_type                  : Weekday | Weekend
-- =============================================================================

INSERT INTO eta.hist_node_travel_times_aggregation
WITH

-- -----------------------------------------------------------------------------
-- Step 1: Parse raw timestamps and compute the operational service day.
--
-- Transit services before 04:00 belong to the previous service day
-- (e.g. a 01:30 trip on Tuesday is logically Monday's schedule).
-- created_at is stored as milliseconds-since-epoch.
-- -----------------------------------------------------------------------------
parsed_timestamps AS (
    SELECT
        hashed_shape_id,
        node_index,
        travel_time_seconds,
        fromUnixTimestamp64Milli(toInt64(created_at)) AS event_ts,
        if(
            toHour(fromUnixTimestamp64Milli(toInt64(created_at))) < 4,
            fromUnixTimestamp64Milli(toInt64(created_at)) - INTERVAL 1 DAY,
            fromUnixTimestamp64Milli(toInt64(created_at))
        ) AS operational_ts
    FROM eta.hist_node_travel_times
    WHERE travel_time_seconds > 0  -- discard zero/null samples (GPS noise, missing segments)
),

-- -----------------------------------------------------------------------------
-- Step 2: Derive date and time fields used for grouping and classification.
-- -----------------------------------------------------------------------------
derived_fields AS (
    SELECT
        hashed_shape_id,
        node_index,
        travel_time_seconds,
        toUInt32(formatDateTime(operational_ts, '%Y%m%d')) AS operational_date,
        toHour(event_ts)             AS event_hour,        -- raw wall-clock hour for period_of_day
        toDayOfWeek(operational_ts)  AS operational_weekday -- 1=Mon … 7=Sun
    FROM parsed_timestamps
),

-- -----------------------------------------------------------------------------
-- Step 3: Classify each sample into calendar and time-of-day segments.
--
-- period       : school-year calendar bucket; ranges manually defined per academic year.
--                Rows outside all known ranges are tagged 'Unknown' and excluded later
--                rather than silently miscategorised.
-- period_of_day: uses raw event_hour (not the shifted operational date) so that
--                a 23:50 trip correctly falls into 'Off Peak', not the next day's AM.
-- weekday/day_type: derived from operational_ts so they respect the pre-4h shift.
-- -----------------------------------------------------------------------------
classified AS (
    SELECT
        hashed_shape_id,
        node_index,
        operational_date,
        travel_time_seconds,

        multiIf(
            (
                operational_date BETWEEN 20230701 AND 20230831
                OR operational_date BETWEEN 20240701 AND 20240901
                OR operational_date BETWEEN 20250630 AND 20250831
                OR operational_date BETWEEN 20260629 AND 20260913
                OR operational_date BETWEEN 20270701 AND 20270831
                OR operational_date BETWEEN 20280701 AND 20280831
                OR operational_date BETWEEN 20290701 AND 20290831
            ), 'Summer',
            (
                operational_date BETWEEN 20230103 AND 20230219
                OR operational_date BETWEEN 20230223 AND 20230324
                OR operational_date BETWEEN 20230410 AND 20230630
                OR operational_date BETWEEN 20230911 AND 20231222
                OR operational_date BETWEEN 20240103 AND 20240211
                OR operational_date BETWEEN 20240215 AND 20240327
                OR operational_date BETWEEN 20240403 AND 20240630
                OR operational_date BETWEEN 20240909 AND 20241220
                OR operational_date BETWEEN 20250106 AND 20250411
                OR operational_date BETWEEN 20250421 AND 20250629
                OR operational_date BETWEEN 20250911 AND 20251219
                OR operational_date BETWEEN 20260105 AND 20260213
                OR operational_date BETWEEN 20260219 AND 20260327
                OR operational_date BETWEEN 20260406 AND 20260628
                OR operational_date BETWEEN 20260914 AND 20261218
                OR operational_date BETWEEN 20270103 AND 20270209
                OR operational_date BETWEEN 20270213 AND 20270630
                OR operational_date BETWEEN 20270913 AND 20271223
                OR operational_date BETWEEN 20280103 AND 20280208
                OR operational_date BETWEEN 20280212 AND 20280630
                OR operational_date BETWEEN 20280911 AND 20281222
                OR operational_date BETWEEN 20290103 AND 20290206
                OR operational_date BETWEEN 20290210 AND 20290630
                OR operational_date BETWEEN 20290910 AND 20291221
            ), 'School',
            (
                operational_date BETWEEN 20230101 AND 20230102
                OR operational_date BETWEEN 20230220 AND 20230222
                OR operational_date BETWEEN 20230325 AND 20230409
                OR operational_date BETWEEN 20230901 AND 20230910
                OR operational_date BETWEEN 20231223 AND 20240102
                OR operational_date BETWEEN 20240212 AND 20240214
                OR operational_date BETWEEN 20240328 AND 20240402
                OR operational_date BETWEEN 20240902 AND 20240908
                OR operational_date BETWEEN 20241221 AND 20250105
                OR operational_date BETWEEN 20250412 AND 20250420
                OR operational_date BETWEEN 20250901 AND 20250910
                OR operational_date BETWEEN 20251220 AND 20260104
                OR operational_date BETWEEN 20260214 AND 20260218
                OR operational_date BETWEEN 20260328 AND 20260405
                OR operational_date BETWEEN 20261219 AND 20270102
                OR operational_date BETWEEN 20270210 AND 20270212
                OR operational_date BETWEEN 20270901 AND 20270912
                OR operational_date BETWEEN 20271224 AND 20280102
                OR operational_date BETWEEN 20280209 AND 20280211
                OR operational_date BETWEEN 20280901 AND 20280910
                OR operational_date BETWEEN 20281223 AND 20290102
                OR operational_date BETWEEN 20290207 AND 20290209
                OR operational_date BETWEEN 20290901 AND 20290909
                OR operational_date BETWEEN 20291222 AND 20291231
            ), 'Christmas',
            'Unknown'
        ) AS period,

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

-- -----------------------------------------------------------------------------
-- Final: Aggregate per shape/node/date/segment combination.
-- Rows with period = 'Unknown' are excluded — they fell outside all defined
-- calendar ranges and should not pollute any aggregate bucket.
-- -----------------------------------------------------------------------------
SELECT
    hashed_shape_id,
    node_index,
    operational_date,
    period,
    period_of_day,
    weekday,
    day_type,
    round(avg(travel_time_seconds))                AS avg_travel_time_seconds,
    round(min(travel_time_seconds))                AS min_travel_time_seconds,
    round(max(travel_time_seconds))                AS max_travel_time_seconds,
    round(quantileExact(0.5)(travel_time_seconds)) AS median_travel_time_seconds
FROM classified
WHERE period != 'Unknown'
GROUP BY
    hashed_shape_id,
    node_index,
    operational_date,
    period,
    period_of_day,
    weekday,
    day_type;
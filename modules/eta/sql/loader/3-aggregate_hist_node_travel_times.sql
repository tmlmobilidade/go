-- =============================================================================
-- Aggregates travel time statistics per shape, node, and calendar/time segment.
-- Source: node_travel_times_samples
-- Target: node_travel_times_aggregates
--
-- Dimensions produced:
--   - operational_date : service date (pre-4h events shifted to previous day)
--   - period_of_day             : time-of-day bucket based on event hour
--   - weekday                   : day name
--   - day_type                  : Weekday | Weekend
-- =============================================================================

INSERT INTO {database}.hist_node_travel_times_aggregation
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
    FROM {database}.hist_node_travel_times
    WHERE
        travel_time_seconds > 0  -- discard zero/null samples (GPS noise, missing segments)
        AND created_at >= {window_start}
        AND created_at < {window_end}
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
-- Step 3: Classify each sample into time-of-day segments.
--
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
-- -----------------------------------------------------------------------------
SELECT
    hashed_shape_id,
    node_index,
    operational_date,
    period_of_day,
    weekday,
    day_type,
    round(avg(travel_time_seconds))                AS avg_travel_time_seconds,
    round(min(travel_time_seconds))                AS min_travel_time_seconds,
    round(max(travel_time_seconds))                AS max_travel_time_seconds,
    round(quantileExact(0.5)(travel_time_seconds)) AS median_travel_time_seconds,
    now()                                          AS inserted_at
FROM classified
GROUP BY
    hashed_shape_id,
    node_index,
    operational_date,
    period_of_day,
    weekday,
    day_type;

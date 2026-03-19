WITH
-- Tune the target segment and reference date here.
params AS (
    SELECT
        -- Shape information
        'f8ba96811d682cc424981d9c3095efa3698d5363ad645d1942da55d983f2a9fc' AS shape_id,
        toUInt32(200) AS node_start,
        toUInt32(383) AS node_end,
        -- Current Date Information
        toYYYYMMDD(now()) as start_operational_date,
        'Thursday' AS target_weekday,
        'Weekday' AS target_day_type,
        'School' AS target_period,
        'Mid' AS target_period_of_day
),

-- Create the previous n days for each window
prev_3d AS (
    SELECT p.start_operational_date - n.number - 1 AS operational_date
    FROM numbers(3) AS n
    CROSS JOIN params AS p
),

prev_7d AS (
    SELECT p.start_operational_date - n.number - 1 AS operational_date
    FROM numbers(7) AS n
    CROSS JOIN params AS p
),

prev_14d AS (
    SELECT p.start_operational_date - n.number - 1 AS operational_date
    FROM numbers(14) AS n
    CROSS JOIN params AS p
),

prev_30d AS (
    SELECT p.start_operational_date - n.number - 1 AS operational_date
    FROM numbers(30) AS n
    CROSS JOIN params AS p
),

-- Tune all weights here (table-driven via CTE).
weights AS (
    SELECT
        toFloat64(1.00) AS w_last_3d,
        toFloat64(0.90) AS w_last_7d,
        toFloat64(0.75) AS w_last_14d,
        toFloat64(0.50) AS w_last_30d,
        toFloat64(0.85) AS w_same_weekday,
        toFloat64(0.80) AS w_same_day_type,
        toFloat64(0.70) AS w_same_period,
        toFloat64(0.95) AS w_same_period_of_day
),

-- Filter the data based on the shape parameters
base AS (
   SELECT 
    a.operational_date as operational_date,
    a.node_index,
    a.median_travel_time_seconds,
    a.weekday,
    a.day_type as day_type,
    a.period as period,
    a.period_of_day as period_of_day
   FROM node_travel_times_aggregates AS a
   CROSS JOIN params AS p
   WHERE
        a.shape_id = p.shape_id
        AND a.node_index BETWEEN p.node_start AND p.node_end
        AND a.operational_date IN (SELECT operational_date FROM prev_30d)
),

-- Sums Median Travel Times by operational_date and (weekday_period_period_of_day)
daily_sums AS (
    SELECT
        operational_date,
        weekday,
        period,
        day_type,
        period_of_day,
        sum(median_travel_time_seconds) AS segment_sum
    FROM base
    GROUP BY operational_date, weekday, period, day_type, period_of_day
),

-- Calculate Averages of the daily sums for each window
avg_prev_3d AS (
    SELECT
        avg(ds.segment_sum) AS avg_prev_3d
    FROM daily_sums AS ds
    CROSS JOIN prev_3d AS p3
    CROSS JOIN params AS p
    WHERE
        ds.operational_date = p3.operational_date
        AND ds.period_of_day = p.target_period_of_day
),

avg_prev_7d AS (
    SELECT
        avg(ds.segment_sum) AS avg_prev_7d
    FROM daily_sums AS ds
    CROSS JOIN prev_7d AS p7
    CROSS JOIN params AS p
    WHERE
        ds.operational_date = p7.operational_date
        AND ds.period_of_day = p.target_period_of_day
),

avg_prev_14d AS (
    SELECT
        avg(ds.segment_sum) AS avg_prev_14d
    FROM daily_sums AS ds
    CROSS JOIN prev_14d AS p14
    CROSS JOIN params AS p
    WHERE
        ds.operational_date = p14.operational_date
        AND ds.period_of_day = p.target_period_of_day
),

avg_prev_30d AS ( 
    SELECT
        avg(ds.segment_sum) AS avg_prev_30d
    FROM daily_sums AS ds
    CROSS JOIN prev_30d AS p30
    CROSS JOIN params AS p
    WHERE
        ds.operational_date = p30.operational_date
        AND ds.period_of_day = p.target_period_of_day
),

avg_same_weekday AS (
    SELECT
        avg(ds.segment_sum) AS avg_same_weekday
    FROM daily_sums AS ds
    CROSS JOIN params AS p
    WHERE
        ds.weekday = p.target_weekday
        AND ds.period_of_day = p.target_period_of_day
),

avg_same_day_type AS (
    SELECT
        avg(ds.segment_sum) AS avg_same_day_type
    FROM daily_sums AS ds
    CROSS JOIN params AS p
    WHERE
        ds.day_type = p.target_day_type
        AND ds.period_of_day = p.target_period_of_day
),

avg_same_period AS (
    SELECT
        avg(ds.segment_sum) AS avg_same_period
    FROM daily_sums AS ds
    CROSS JOIN params AS p
    WHERE
        ds.period = p.target_period
        AND ds.period_of_day = p.target_period_of_day
),

averages as (
    SELECT
        (SELECT avg_prev_3d FROM avg_prev_3d) AS avg_prev_3d,
        (SELECT avg_prev_7d FROM avg_prev_7d) AS avg_prev_7d,
        (SELECT avg_prev_14d FROM avg_prev_14d) AS avg_prev_14d,
        (SELECT avg_prev_30d FROM avg_prev_30d) AS avg_prev_30d,
        (SELECT avg_same_weekday FROM avg_same_weekday) AS avg_same_weekday,
        (SELECT avg_same_day_type FROM avg_same_day_type) AS avg_same_day_type,
        (SELECT avg_same_period FROM avg_same_period) AS avg_same_period
),

-- Weighted average normalized by sum of non-NULL signal weights.
-- This ensures a missing signal (no data in window) doesn't deflate the result.
weighted AS (
    SELECT
        a.avg_prev_3d,
        a.avg_prev_7d,
        a.avg_prev_14d,
        a.avg_prev_30d,
        a.avg_same_weekday,
        a.avg_same_day_type,
        a.avg_same_period,

        -- Effective weight sum: only count weights for signals that returned data
        (
            if(isNotNull(a.avg_prev_3d),        w.w_last_3d,         0) +
            if(isNotNull(a.avg_prev_7d),        w.w_last_7d,         0) +
            if(isNotNull(a.avg_prev_14d),       w.w_last_14d,        0) +
            if(isNotNull(a.avg_prev_30d),       w.w_last_30d,        0) +
            if(isNotNull(a.avg_same_weekday),   w.w_same_weekday,    0) +
            if(isNotNull(a.avg_same_day_type),  w.w_same_day_type,   0) +
            if(isNotNull(a.avg_same_period),    w.w_same_period,     0)
        ) AS total_weight,

        -- Weighted sum of available signals
        (
            coalesce(a.avg_prev_3d,        0) * w.w_last_3d         * if(isNotNull(a.avg_prev_3d),        1, 0) +
            coalesce(a.avg_prev_7d,        0) * w.w_last_7d         * if(isNotNull(a.avg_prev_7d),        1, 0) +
            coalesce(a.avg_prev_14d,       0) * w.w_last_14d        * if(isNotNull(a.avg_prev_14d),       1, 0) +
            coalesce(a.avg_prev_30d,       0) * w.w_last_30d        * if(isNotNull(a.avg_prev_30d),       1, 0) +
            coalesce(a.avg_same_weekday,   0) * w.w_same_weekday    * if(isNotNull(a.avg_same_weekday),   1, 0) +
            coalesce(a.avg_same_day_type,  0) * w.w_same_day_type   * if(isNotNull(a.avg_same_day_type),  1, 0) +
            coalesce(a.avg_same_period,    0) * w.w_same_period     * if(isNotNull(a.avg_same_period),    1, 0)
        ) AS weighted_sum

    FROM averages AS a
    CROSS JOIN weights AS w
)

SELECT
    avg_prev_3d,
    avg_prev_7d,
    avg_prev_14d,
    avg_prev_30d,
    avg_same_weekday,
    avg_same_day_type,
    avg_same_period,
    total_weight,
    weighted_sum,
    if(total_weight > 0, weighted_sum / total_weight, NULL) AS predicted_travel_time_seconds
FROM weighted
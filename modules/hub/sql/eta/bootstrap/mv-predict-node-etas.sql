-- Per-node weighted predicted travel time + refreshable MV.
-- Depends: eta.hist_node_travel_times_aggregation, eta.curr_rides.

CREATE TABLE IF NOT EXISTS eta.pred_node_etas
(
    hashed_shape_id String,
    node_index UInt32,
    period_of_day Enum8('Peak AM' = 1, 'Mid' = 2, 'Peak PM' = 3, 'Off Peak' = 4),
    weekday Enum8('Monday' = 1, 'Tuesday' = 2, 'Wednesday' = 3, 'Thursday' = 4, 'Friday' = 5, 'Saturday' = 6, 'Sunday' = 7),
    day_type Enum8('Weekday' = 1, 'Weekend' = 2),
    predicted_travel_time_seconds Nullable(Float64),
    refreshed_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(refreshed_at)
ORDER BY (hashed_shape_id, node_index, period_of_day, weekday, day_type);

-- Refreshable MV: rebuilds eta.pred_node_etas every 15 minutes from the last
-- 30 days of aggregates.
--
-- Scope is deliberately narrow so the table stays small enough for the 30 s
-- trip-stop view to hash-join it every refresh:
--   * only shapes that have a ride in the current window (eta.curr_rides);
--   * only the (weekday, day_type) of the current and the next operational day,
--     so the trip-stop view always finds a row for "now" including across the
--     04:00 service-day boundary.
-- Targets are every (shape, node, period) seen in the window crossed with those
-- two day targets, so a prediction exists even when there is no same-weekday
-- history yet (the blend then falls back to the window means).
CREATE OR REPLACE MATERIALIZED VIEW eta.mv_pred_node_etas
REFRESH EVERY 15 MINUTE
TO eta.pred_node_etas
AS
WITH
    -- Operational "today" in local time: before 04:00 the service day is still yesterday.
    toDate(now() - INTERVAL 4 HOUR, 'Europe/Lisbon') AS today_dt,
    toUInt32(formatDateTime(today_dt - INTERVAL 1 DAY,  '%Y%m%d')) AS ymd_prev_1d,
    toUInt32(formatDateTime(today_dt - INTERVAL 3 DAY,  '%Y%m%d')) AS ymd_prev_3d,
    toUInt32(formatDateTime(today_dt - INTERVAL 7 DAY,  '%Y%m%d')) AS ymd_prev_7d,
    toUInt32(formatDateTime(today_dt - INTERVAL 14 DAY, '%Y%m%d')) AS ymd_prev_14d,
    toUInt32(formatDateTime(today_dt - INTERVAL 30 DAY, '%Y%m%d')) AS ymd_prev_30d,
    weights AS (
        SELECT
            toFloat64(1.00) AS w_last_3d,
            toFloat64(0.90) AS w_last_7d,
            toFloat64(0.75) AS w_last_14d,
            toFloat64(0.50) AS w_last_30d,
            toFloat64(0.85) AS w_same_weekday,
            toFloat64(0.80) AS w_same_day_type
    ),
    active_shapes AS (
        SELECT DISTINCT hashed_shape_id FROM eta.curr_rides
    ),
    -- FINAL: the aggregation is a ReplacingMergeTree that is re-inserted per
    -- operational day; without FINAL a day re-aggregated between merges would
    -- count twice in the averages below.
    base AS (
        SELECT
            hashed_shape_id,
            node_index,
            operational_date,
            weekday,
            day_type,
            period_of_day,
            median_travel_time_seconds
        FROM eta.hist_node_travel_times_aggregation FINAL
        WHERE operational_date BETWEEN ymd_prev_30d AND ymd_prev_1d
          AND hashed_shape_id IN (SELECT hashed_shape_id FROM active_shapes)
    ),
    day_targets AS (
        SELECT
            multiIf(
                dow = 1, 'Monday',
                dow = 2, 'Tuesday',
                dow = 3, 'Wednesday',
                dow = 4, 'Thursday',
                dow = 5, 'Friday',
                dow = 6, 'Saturday',
                'Sunday'
            ) AS weekday,
            if(dow BETWEEN 1 AND 5, 'Weekday', 'Weekend') AS day_type
        FROM (
            SELECT arrayJoin([toDayOfWeek(today_dt), toDayOfWeek(today_dt + INTERVAL 1 DAY)]) AS dow
        )
    ),
    targets AS (
        SELECT DISTINCT
            b.hashed_shape_id AS hashed_shape_id,
            b.node_index      AS node_index,
            b.period_of_day   AS period_of_day,
            d.weekday         AS weekday,
            d.day_type        AS day_type
        FROM (SELECT DISTINCT hashed_shape_id, node_index, period_of_day FROM base) AS b
        CROSS JOIN day_targets AS d
    ),
    agg_window AS (
        SELECT
            hashed_shape_id,
            node_index,
            period_of_day,
            sumIf(median_travel_time_seconds, operational_date >= ymd_prev_3d)
                / nullIf(countIf(operational_date >= ymd_prev_3d),  0) AS avg_prev_3d,
            sumIf(median_travel_time_seconds, operational_date >= ymd_prev_7d)
                / nullIf(countIf(operational_date >= ymd_prev_7d),  0) AS avg_prev_7d,
            sumIf(median_travel_time_seconds, operational_date >= ymd_prev_14d)
                / nullIf(countIf(operational_date >= ymd_prev_14d), 0) AS avg_prev_14d,
            avg(median_travel_time_seconds)                                AS avg_prev_30d
        FROM base
        GROUP BY hashed_shape_id, node_index, period_of_day
    ),
    agg_weekday AS (
        SELECT hashed_shape_id, node_index, period_of_day, toString(weekday) AS weekday,
               avg(median_travel_time_seconds) AS avg_same_weekday
        FROM base GROUP BY hashed_shape_id, node_index, period_of_day, weekday
    ),
    agg_day_type AS (
        SELECT hashed_shape_id, node_index, period_of_day, toString(day_type) AS day_type,
               avg(median_travel_time_seconds) AS avg_same_day_type
        FROM base GROUP BY hashed_shape_id, node_index, period_of_day, day_type
    ),
    weighted AS (
        SELECT
            t.hashed_shape_id AS hashed_shape_id,
            t.node_index      AS node_index,
            t.period_of_day   AS period_of_day,
            t.weekday         AS weekday,
            t.day_type        AS day_type,
            (
                if(isNotNull(aw.avg_prev_3d),        w.w_last_3d,       0) +
                if(isNotNull(aw.avg_prev_7d),        w.w_last_7d,       0) +
                if(isNotNull(aw.avg_prev_14d),       w.w_last_14d,      0) +
                if(isNotNull(aw.avg_prev_30d),       w.w_last_30d,      0) +
                if(isNotNull(awd.avg_same_weekday),  w.w_same_weekday,  0) +
                if(isNotNull(adt.avg_same_day_type), w.w_same_day_type, 0)
            ) AS total_weight,
            (
                coalesce(aw.avg_prev_3d,        0) * w.w_last_3d        +
                coalesce(aw.avg_prev_7d,        0) * w.w_last_7d        +
                coalesce(aw.avg_prev_14d,       0) * w.w_last_14d       +
                coalesce(aw.avg_prev_30d,       0) * w.w_last_30d       +
                coalesce(awd.avg_same_weekday,  0) * w.w_same_weekday   +
                coalesce(adt.avg_same_day_type, 0) * w.w_same_day_type
            ) AS weighted_sum
        FROM targets AS t
        CROSS JOIN weights AS w
        LEFT JOIN agg_window   AS aw  ON aw.hashed_shape_id = t.hashed_shape_id  AND aw.node_index = t.node_index  AND aw.period_of_day = t.period_of_day
        LEFT JOIN agg_weekday  AS awd ON awd.hashed_shape_id = t.hashed_shape_id AND awd.node_index = t.node_index AND awd.period_of_day = t.period_of_day AND awd.weekday  = t.weekday
        LEFT JOIN agg_day_type AS adt ON adt.hashed_shape_id = t.hashed_shape_id AND adt.node_index = t.node_index AND adt.period_of_day = t.period_of_day AND adt.day_type = t.day_type
    )
SELECT
    hashed_shape_id,
    node_index,
    period_of_day,
    weekday,
    day_type,
    if(total_weight > 0, weighted_sum / total_weight, NULL) AS predicted_travel_time_seconds,
    now() AS refreshed_at
FROM weighted
SETTINGS join_use_nulls = 1;

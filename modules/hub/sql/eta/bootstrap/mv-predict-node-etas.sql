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

ALTER TABLE eta.pred_node_etas
    ADD COLUMN IF NOT EXISTS effective_sample_count Float64 DEFAULT 0,
    ADD COLUMN IF NOT EXISTS p10_seconds Float64 DEFAULT 0,
    ADD COLUMN IF NOT EXISTS p90_seconds Float64 DEFAULT 0,
    ADD COLUMN IF NOT EXISTS stddev_seconds Float64 DEFAULT 0,
    ADD COLUMN IF NOT EXISTS estimate_source LowCardinality(String) DEFAULT 'legacy';

-- One non-overlapping weight per day: support x recency x calendar similarity.
-- Statistics are mixtures of daily summaries, not exact pooled quantiles.
CREATE OR REPLACE MATERIALIZED VIEW eta.mv_pred_node_etas
REFRESH EVERY 15 MINUTE TO eta.pred_node_etas AS
WITH
    toDate(now('Europe/Lisbon') - INTERVAL 4 HOUR) AS service_day,
    base AS (
        SELECT *,
            exp(-dateDiff('day', toDate(parseDateTimeBestEffort(toString(operational_date))), service_day) / 7.)
                * least(toFloat64(sample_count), 20.) AS support
        FROM eta.hist_node_travel_times_aggregation FINAL
        WHERE sample_count > 0 AND median_travel_time_seconds > 0
          AND isFinite(median_travel_time_seconds)
          AND operational_date >= toYYYYMMDD(service_day - INTERVAL 30 DAY)
          AND operational_date < toYYYYMMDD(service_day)
          AND hashed_shape_id IN (SELECT hashed_shape_id FROM eta.curr_rides FINAL)
    ),
    contexts AS (
        SELECT DISTINCT
            arrayElement(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], dow) AS weekday,
            if(dow <= 5, 'Weekday', 'Weekend') AS day_type,
            arrayJoin(['Peak AM','Mid','Peak PM','Off Peak']) AS period_of_day
        FROM (SELECT arrayJoin([toDayOfWeek(service_day), toDayOfWeek(service_day + INTERVAL 1 DAY)]) AS dow)
    ),
    targets AS (
        SELECT n.hashed_shape_id AS hashed_shape_id, n.node_index AS node_index,
            c.weekday AS weekday, c.day_type AS day_type, c.period_of_day AS period_of_day
        FROM eta.hist_shape_nodes AS n FINAL CROSS JOIN contexts AS c
        WHERE n.hashed_shape_id IN (SELECT hashed_shape_id FROM eta.curr_rides FINAL)
    ),
    prior AS (
        SELECT hashed_shape_id, period_of_day,
            sum(median_travel_time_seconds * support) / nullIf(sum(support), 0.) AS seconds
        FROM base GROUP BY hashed_shape_id, period_of_day
    ),
    weighted AS (
        SELECT t.hashed_shape_id AS hashed_shape_id, t.node_index AS node_index,
            t.weekday AS weekday, t.day_type AS day_type, t.period_of_day AS period_of_day,
            b.support * multiIf(b.weekday = t.weekday, 1., b.day_type = t.day_type, 0.7, 0.35) AS weight,
            b.median_travel_time_seconds AS seconds,
            b.p10_travel_time_seconds AS p10, b.p90_travel_time_seconds AS p90,
            b.stddev_travel_time_seconds AS stddev
        FROM targets AS t
        LEFT JOIN base AS b ON b.hashed_shape_id = t.hashed_shape_id
            AND b.node_index = t.node_index AND b.period_of_day = t.period_of_day
    ),
    pooled AS (
        SELECT hashed_shape_id, node_index, weekday, day_type, period_of_day,
            coalesce(sum(weight), 0.) AS effective_sample_count,
            coalesce(sum(seconds * weight), 0.) AS weighted_seconds,
            sum(p10 * weight) / nullIf(sum(weight), 0.) AS p10,
            sum(p90 * weight) / nullIf(sum(weight), 0.) AS p90,
            sqrt(greatest(0., sum((stddev * stddev + seconds * seconds) * weight) /
                nullIf(sum(weight), 0.) - pow(weighted_seconds / nullIf(sum(weight), 0.), 2))) AS stddev
        FROM weighted GROUP BY hashed_shape_id, node_index, weekday, day_type, period_of_day
    )
SELECT
    a.hashed_shape_id AS hashed_shape_id, a.node_index AS node_index,
    a.period_of_day AS period_of_day, a.weekday AS weekday, a.day_type AS day_type,
    (a.weighted_seconds + 5. * coalesce(p.seconds, 25. / 4.)) /
        (a.effective_sample_count + 5.) AS predicted_travel_time_seconds,
    a.effective_sample_count AS effective_sample_count,
    coalesce(a.p10, predicted_travel_time_seconds * 0.5) AS p10_seconds,
    coalesce(a.p90, predicted_travel_time_seconds * 2.) AS p90_seconds,
    coalesce(a.stddev, predicted_travel_time_seconds) AS stddev_seconds,
    if(a.effective_sample_count > 0, 'node_shrunk', if(p.seconds IS NOT NULL, 'shape_time_prior', 'distance_prior')) AS estimate_source,
    now() AS refreshed_at
FROM pooled AS a
LEFT JOIN prior AS p ON p.hashed_shape_id = a.hashed_shape_id AND p.period_of_day = a.period_of_day
SETTINGS join_use_nulls = 1;

-- Live ETA per stop + refreshable MV.
-- Depends: {database}.live_vehicle_positions, {database}.curr_rides, {database}.curr_waypoints_snapped,
--          {database}.node_predictions (02-node-predictions-mv.sql).

CREATE TABLE IF NOT EXISTS {database}.pred_trip_stop_etas
(
    trip_id String,
    vehicle_id String,
    hashed_trip_id String,
    hashed_shape_id String,
    current_node_index UInt32,
    position_created_at Int64,
    stop_sequence UInt16,
    stop_id String,
    stop_name String,
    stop_node_index UInt32,
    eta_seconds Nullable(Float64),
    eta_at Nullable(DateTime64(3)),
    refreshed_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(refreshed_at)
ORDER BY (trip_id, vehicle_id, stop_sequence);

CREATE MATERIALIZED VIEW IF NOT EXISTS {database}.mv_pred_trip_stop_etas
REFRESH EVERY 30 SECOND
TO {database}.pred_trip_stop_etas
AS
WITH
    latest_pos AS (
        SELECT
            trip_id,
            vehicle_id,
            argMax(hashed_shape_id, created_at) AS hashed_shape_id,
            argMax(node_index, created_at)      AS current_node_index,
            max(created_at)                     AS position_created_at
        FROM {database}.curr_vehicle_events
        WHERE created_at >= toUnixTimestamp64Milli(now64(3)) - 30 * 60 * 1000
        GROUP BY trip_id, vehicle_id
    ),
    pos_with_trip AS (
        SELECT
            lp.trip_id             AS trip_id,
            lp.vehicle_id          AS vehicle_id,
            lp.hashed_shape_id     AS hashed_shape_id,
            d.hashed_trip_id       AS hashed_trip_id,
            lp.current_node_index  AS current_node_index,
            lp.position_created_at AS position_created_at,
            fromUnixTimestamp64Milli(lp.position_created_at) AS pos_dt
        FROM latest_pos AS lp
        INNER JOIN {database}.curr_rides AS d ON lp.trip_id = d.trip_id
    ),
    pos_with_op_dt AS (
        SELECT
            *,
            toHour(pos_dt)                                                 AS event_hour,
            if(toHour(pos_dt) < 4, pos_dt - INTERVAL 1 DAY, pos_dt)        AS operational_dt
        FROM pos_with_trip
    ),
    pos_classified AS (
        SELECT
            *,
            toUInt32(formatDateTime(operational_dt, '%Y%m%d')) AS operational_date,
            toDayOfWeek(operational_dt)                        AS dow,
            multiIf(
                event_hour BETWEEN 7  AND 9,  'Peak AM',
                event_hour BETWEEN 10 AND 16, 'Mid',
                event_hour BETWEEN 17 AND 19, 'Peak PM',
                'Off Peak'
            ) AS period_of_day
        FROM pos_with_op_dt
    ),
    pos_full AS (
        SELECT
            *,
            multiIf(
                dow = 1, 'Monday',
                dow = 2, 'Tuesday',
                dow = 3, 'Wednesday',
                dow = 4, 'Thursday',
                dow = 5, 'Friday',
                dow = 6, 'Saturday',
                'Sunday'
            ) AS weekday,
            if(dow BETWEEN 1 AND 5, 'Weekday', 'Weekend') AS day_type,
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
            ) AS period
        FROM pos_classified
    ),
    recent_events AS (
        SELECT
            pf.trip_id             AS trip_id,
            pf.vehicle_id          AS vehicle_id,
            pf.hashed_shape_id     AS hashed_shape_id,
            pf.period_of_day       AS period_of_day,
            pf.weekday             AS weekday,
            pf.day_type            AS day_type,
            pf.period              AS period,
            pf.position_created_at AS position_created_at,
            e.node_index           AS node_index,
            e.created_at           AS created_at
        FROM pos_full AS pf
        INNER JOIN {database}.curr_vehicle_events AS e
            ON e.trip_id = pf.trip_id
           AND e.vehicle_id = pf.vehicle_id
        WHERE e.created_at BETWEEN pf.position_created_at - 10 * 60 * 1000
                               AND pf.position_created_at
    ),
    event_steps AS (
        SELECT
            trip_id,
            vehicle_id,
            hashed_shape_id,
            period_of_day,
            weekday,
            day_type,
            period,
            position_created_at,
            node_index,
            created_at,
            lagInFrame(toNullable(node_index)) OVER (
                PARTITION BY trip_id, vehicle_id
                ORDER BY created_at
            ) AS prev_node_index,
            lagInFrame(toNullable(created_at)) OVER (
                PARTITION BY trip_id, vehicle_id
                ORDER BY created_at
            ) AS prev_created_at
        FROM recent_events
    ),
    live_observed AS (
        SELECT
            trip_id,
            vehicle_id,
            hashed_shape_id,
            period_of_day,
            weekday,
            day_type,
            period,
            position_created_at,
            countIf(
                prev_node_index IS NOT NULL
                AND prev_created_at IS NOT NULL
                AND node_index > prev_node_index
                AND created_at > prev_created_at
            ) AS move_samples,
            sumIf(
                (created_at - prev_created_at) / 1000.0,
                prev_node_index IS NOT NULL
                AND prev_created_at IS NOT NULL
                AND node_index > prev_node_index
                AND created_at > prev_created_at
            ) AS observed_seconds,
            minIf(
                prev_node_index,
                prev_node_index IS NOT NULL
                AND prev_created_at IS NOT NULL
                AND node_index > prev_node_index
                AND created_at > prev_created_at
            ) AS start_node_index,
            maxIf(
                node_index,
                prev_node_index IS NOT NULL
                AND prev_created_at IS NOT NULL
                AND node_index > prev_node_index
                AND created_at > prev_created_at
            ) AS end_node_index
        FROM event_steps
        GROUP BY
            trip_id,
            vehicle_id,
            hashed_shape_id,
            period_of_day,
            weekday,
            day_type,
            period,
            position_created_at
    ),
    live_baseline AS (
        SELECT
            lo.trip_id             AS trip_id,
            lo.vehicle_id          AS vehicle_id,
            lo.position_created_at AS position_created_at,
            lo.move_samples        AS move_samples,
            lo.observed_seconds    AS observed_seconds,
            sum(p.predicted_travel_time_seconds) AS baseline_seconds
        FROM live_observed AS lo
        LEFT JOIN {database}.pred_node_etas AS p
            ON p.hashed_shape_id = lo.hashed_shape_id
           AND p.period_of_day   = lo.period_of_day
           AND p.weekday         = lo.weekday
           AND p.day_type        = lo.day_type
           AND p.period          = lo.period
           AND p.node_index >  lo.start_node_index
           AND p.node_index <= lo.end_node_index
        GROUP BY
            lo.trip_id,
            lo.vehicle_id,
            lo.position_created_at,
            lo.move_samples,
            lo.observed_seconds
    ),
    live_factor AS (
        SELECT
            trip_id,
            vehicle_id,
            if(
                move_samples > 0
                AND observed_seconds > 0
                AND baseline_seconds > 0
                AND isFinite(observed_seconds / baseline_seconds),
                greatest(
                    toFloat64(0.7),
                    least(
                        toFloat64(1.4),
                        1
                        + (
                            least(toFloat64(0.45), toFloat64(move_samples) / 8.0)
                            * exp(
                                -greatest(
                                    toFloat64(0),
                                    (toUnixTimestamp64Milli(now64(3)) - position_created_at) / 1000.0
                                ) / 180.0
                            )
                        ) * ((observed_seconds / baseline_seconds) - 1)
                    )
                ),
                toFloat64(1)
            ) AS live_adjustment
        FROM live_baseline
    ),
    upcoming AS (
        SELECT
            pf.trip_id             AS trip_id,
            pf.vehicle_id          AS vehicle_id,
            pf.hashed_shape_id     AS hashed_shape_id,
            pf.hashed_trip_id      AS hashed_trip_id,
            pf.current_node_index  AS current_node_index,
            pf.position_created_at AS position_created_at,
            pf.period_of_day       AS period_of_day,
            pf.weekday             AS weekday,
            pf.day_type            AS day_type,
            pf.period              AS period,
            w.stop_sequence        AS stop_sequence,
            w.stop_id              AS stop_id,
            w.stop_name            AS stop_name,
            w.node_index           AS stop_node_index
        FROM pos_full AS pf
        INNER JOIN {database}.curr_waypoints_snapped AS w
            ON pf.hashed_trip_id = w.hashed_trip_id
        WHERE w.node_index >= pf.current_node_index
          AND pf.period != 'Unknown'
    ),
    eta_calc AS (
        SELECT
            u.trip_id             AS trip_id,
            u.vehicle_id          AS vehicle_id,
            u.hashed_trip_id      AS hashed_trip_id,
            u.hashed_shape_id     AS hashed_shape_id,
            u.current_node_index  AS current_node_index,
            u.position_created_at AS position_created_at,
            u.stop_sequence       AS stop_sequence,
            u.stop_id             AS stop_id,
            u.stop_name           AS stop_name,
            u.stop_node_index     AS stop_node_index,
            sumIf(
                p.predicted_travel_time_seconds * coalesce(lf.live_adjustment, toFloat64(1)),
                p.node_index >  u.current_node_index
                AND p.node_index <= u.stop_node_index
            ) AS eta_seconds
        FROM upcoming AS u
        LEFT JOIN {database}.pred_node_etas AS p
            ON p.hashed_shape_id      = u.hashed_shape_id
           AND p.period_of_day = u.period_of_day
           AND p.weekday       = u.weekday
           AND p.day_type      = u.day_type
           AND p.period        = u.period
        LEFT JOIN live_factor AS lf
            ON lf.trip_id    = u.trip_id
           AND lf.vehicle_id = u.vehicle_id
        GROUP BY
            u.trip_id,
            u.vehicle_id,
            u.hashed_trip_id,
            u.hashed_shape_id,
            u.current_node_index,
            u.position_created_at,
            u.stop_sequence,
            u.stop_id,
            u.stop_name,
            u.stop_node_index
    ),
    eta_clean AS (
        SELECT
            trip_id,
            vehicle_id,
            hashed_trip_id,
            hashed_shape_id,
            current_node_index,
            position_created_at,
            stop_sequence,
            stop_id,
            stop_name,
            stop_node_index,
            if(eta_seconds IS NOT NULL AND isFinite(assumeNotNull(eta_seconds)),
               eta_seconds, NULL) AS eta_seconds
        FROM eta_calc
    )
SELECT
    trip_id,
    vehicle_id,
    hashed_trip_id,
    hashed_shape_id,
    current_node_index,
    position_created_at,
    stop_sequence,
    stop_id,
    stop_name,
    stop_node_index,
    eta_seconds,
    if(
        eta_seconds IS NULL,
        NULL,
        fromUnixTimestamp64Milli(position_created_at)
            + toIntervalSecond(toInt64(round(assumeNotNull(eta_seconds))))
    ) AS eta_at,
    now() AS refreshed_at
FROM eta_clean;

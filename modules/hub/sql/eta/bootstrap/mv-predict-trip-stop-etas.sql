-- Live ETA per stop + refreshable MV.
-- Depends: eta.curr_vehicle_events, eta.curr_rides, eta.curr_waypoints_snapped,
--          eta.pred_node_etas (mv-predict-node-etas.sql),
--          infrastructure.simplified_stops (agency stop_id → GO _id via legacy_ids).

CREATE TABLE IF NOT EXISTS eta.pred_trip_stop_etas_v2
(
    ride_id String,
    route_id String,
    operational_date UInt32,
    position_received_at Int64,
    trip_id String,
    agency_id String,
    plan_id String,
    vehicle_id String,
    hashed_trip_id String,
    hashed_shape_id String,
    current_node_index UInt32,
    current_node_latitude Float64,
    current_node_longitude Float64,
    position_created_at Int64,
    stop_sequence UInt16,
    stop_id String,
    stop_name String,
    stop_node_index UInt32,
    stop_node_latitude Float64,
    stop_node_longitude Float64,
    eta_seconds Nullable(UInt16),
    eta_at Nullable(Int64),
    refreshed_at Int64
)
ENGINE = ReplacingMergeTree(refreshed_at)
ORDER BY (ride_id, vehicle_id, stop_sequence);

ALTER TABLE eta.pred_trip_stop_etas_v2
    ADD COLUMN IF NOT EXISTS ride_id String,
    ADD COLUMN IF NOT EXISTS route_id String,
    ADD COLUMN IF NOT EXISTS operational_date UInt32,
    ADD COLUMN IF NOT EXISTS position_received_at Int64,
    ADD COLUMN IF NOT EXISTS baseline_eta_at Nullable(Int64) DEFAULT eta_at,
    ADD COLUMN IF NOT EXISTS prediction_version String DEFAULT 'statistical-v1',
    ADD COLUMN IF NOT EXISTS history_coverage Float64 DEFAULT 0,
    ADD COLUMN IF NOT EXISTS freshness_tier LowCardinality(String) DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS prediction_confidence Float64 DEFAULT 0;

CREATE OR REPLACE MATERIALIZED VIEW eta.mv_pred_trip_stop_etas
REFRESH EVERY 30 SECOND TO eta.pred_trip_stop_etas_v2 AS
WITH
    toUnixTimestamp64Milli(now64(3)) AS now_ms,
    latest AS (
        SELECT ride_id, vehicle_id, hashed_shape_id,
            argMax(node_index, tuple(created_at, _id)) AS current_node_index,
            argMax(received_at, tuple(created_at, _id)) AS position_received_at,
            max(created_at) AS position_created_at
        FROM eta.curr_vehicle_events FINAL
        WHERE created_at >= now_ms - (SELECT max_gps_seconds FROM eta.policy) * 1000
          AND created_at <= now_ms + (SELECT future_tolerance_seconds FROM eta.policy) * 1000
          AND received_at - created_at <= (SELECT max_ingestion_lag_seconds FROM eta.policy) * 1000
          AND ride_id != ''
        GROUP BY ride_id, vehicle_id, hashed_shape_id
    ),
    positions AS (
        SELECT l.ride_id AS ride_id, l.vehicle_id AS vehicle_id, l.hashed_shape_id AS hashed_shape_id, l.current_node_index AS current_node_index, l.position_received_at AS position_received_at, l.position_created_at AS position_created_at, r.trip_id AS trip_id, r.agency_id AS agency_id,
            r.plan_id AS plan_id, r.route_id AS route_id,
            r.hashed_trip_id AS hashed_trip_id, r.operational_date AS operational_date,
            cn.latitude AS current_node_latitude, cn.longitude AS current_node_longitude,
            toHour(fromUnixTimestamp64Milli(l.position_created_at, 'Europe/Lisbon')) AS local_hour,
            multiIf(local_hour BETWEEN 7 AND 9, 'Peak AM', local_hour BETWEEN 10 AND 16, 'Mid',
                    local_hour BETWEEN 17 AND 19, 'Peak PM', 'Off Peak') AS period_of_day,
            toDayOfWeek(toDate(parseDateTimeBestEffort(toString(r.operational_date)))) AS dow,
            arrayElement(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], dow) AS weekday,
            if(dow <= 5, 'Weekday', 'Weekend') AS day_type
        FROM latest AS l
        INNER JOIN eta.curr_rides AS r FINAL ON r._id = l.ride_id AND r.hashed_shape_id = l.hashed_shape_id
        INNER JOIN eta.hist_shape_nodes AS cn FINAL
            ON cn.hashed_shape_id = l.hashed_shape_id AND cn.node_index = l.current_node_index
        WHERE (r.end_time_observed IS NULL OR r.end_time_observed = 0 OR r.end_time_observed > now_ms)
          AND now_ms <= r.end_time_scheduled + 4 * 3600000
    ),
    steps AS (
        SELECT e.ride_id AS ride_id, e.vehicle_id AS vehicle_id,
            e.hashed_shape_id AS hashed_shape_id, e.node_index AS node_index, e.created_at AS created_at,
            lagInFrame(toNullable(e.node_index)) OVER w AS prev_node,
            lagInFrame(toNullable(e.created_at)) OVER w AS prev_at
        FROM eta.curr_vehicle_events AS e FINAL
        WHERE e.created_at >= now_ms - 600000
        WINDOW w AS (PARTITION BY ride_id, vehicle_id, hashed_shape_id ORDER BY created_at, _id)
    ),
    movement AS (
        SELECT p.ride_id AS ride_id, p.vehicle_id AS vehicle_id,
            s.created_at AS created_at, s.prev_at AS prev_at,
            sum(n.predicted_travel_time_seconds) AS expected_seconds
        FROM positions AS p
        INNER JOIN steps AS s ON s.ride_id = p.ride_id AND s.vehicle_id = p.vehicle_id
            AND s.hashed_shape_id = p.hashed_shape_id
        INNER JOIN eta.pred_node_etas AS n FINAL ON n.hashed_shape_id = p.hashed_shape_id
            AND n.period_of_day = p.period_of_day AND n.weekday = p.weekday AND n.day_type = p.day_type
            AND n.node_index > s.prev_node AND n.node_index <= s.node_index
        WHERE s.node_index > s.prev_node AND s.created_at > s.prev_at
          AND s.created_at - s.prev_at <= 120000
          AND (s.node_index - s.prev_node) * 25. / ((s.created_at - s.prev_at) / 1000.) <= 33.34
        GROUP BY p.ride_id, p.vehicle_id, s.created_at, s.prev_at
    ),
    live_factor AS (
        SELECT ride_id, vehicle_id,
            greatest(0.7, least(1.4, 1. +
                least(0.45, count() / 8.) * exp(-greatest(0., (now_ms - max(created_at)) / 1000.) / 180.) *
                (sum((created_at - prev_at) / 1000.) / nullIf(sum(expected_seconds), 0.) - 1.))) AS factor
        FROM movement GROUP BY ride_id, vehicle_id
    ),
    shape_priors AS (
        SELECT hashed_shape_id, period_of_day, weekday, day_type,
            avgOrNullIf(predicted_travel_time_seconds,
                predicted_travel_time_seconds > 0 AND isFinite(predicted_travel_time_seconds)) AS shape_seconds
        FROM eta.pred_node_etas FINAL
        GROUP BY hashed_shape_id, period_of_day, weekday, day_type
    ),
    node_inputs AS (
        SELECT p.ride_id AS ride_id, p.vehicle_id AS vehicle_id, n.node_index AS node_index,
            if(h.predicted_travel_time_seconds > 0 AND isFinite(h.predicted_travel_time_seconds),
               h.predicted_travel_time_seconds, NULL) AS direct_seconds,
            sp.shape_seconds AS shape_seconds,
            coalesce(lf.factor, 1.) AS vehicle_factor
        FROM positions AS p
        INNER JOIN eta.hist_shape_nodes AS n FINAL
            ON n.hashed_shape_id = p.hashed_shape_id AND n.node_index > p.current_node_index
        LEFT JOIN eta.pred_node_etas AS h FINAL
            ON h.hashed_shape_id = n.hashed_shape_id AND h.node_index = n.node_index
            AND h.period_of_day = p.period_of_day AND h.weekday = p.weekday AND h.day_type = p.day_type
        LEFT JOIN shape_priors AS sp ON sp.hashed_shape_id = p.hashed_shape_id
            AND sp.period_of_day = p.period_of_day AND sp.weekday = p.weekday AND sp.day_type = p.day_type
        LEFT JOIN live_factor AS lf ON lf.ride_id = p.ride_id AND lf.vehicle_id = p.vehicle_id
    ),
    node_times AS (
        SELECT ride_id, vehicle_id, node_index, direct_seconds IS NOT NULL AS has_history,
            coalesce(direct_seconds,
                avgOrNull(direct_seconds) OVER (PARTITION BY ride_id, vehicle_id ORDER BY node_index
                    ROWS BETWEEN 4 PRECEDING AND 4 FOLLOWING),
                shape_seconds, 25. / 4.) * vehicle_factor AS node_seconds
        FROM node_inputs
    ),
    cumulative AS (
        SELECT ride_id, vehicle_id, node_index,
            sum(node_seconds) OVER w AS seconds,
            countIf(has_history) OVER w AS known_nodes
        FROM node_times
        WINDOW w AS (PARTITION BY ride_id, vehicle_id ORDER BY node_index
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
    ),
    upcoming AS (
        SELECT p.ride_id AS ride_id, p.vehicle_id AS vehicle_id, p.hashed_shape_id AS hashed_shape_id, p.current_node_index AS current_node_index, p.position_received_at AS position_received_at, p.position_created_at AS position_created_at, p.trip_id AS trip_id, p.agency_id AS agency_id, p.plan_id AS plan_id, p.route_id AS route_id, p.hashed_trip_id AS hashed_trip_id, p.operational_date AS operational_date, p.current_node_latitude AS current_node_latitude, p.current_node_longitude AS current_node_longitude, p.local_hour AS local_hour, p.period_of_day AS period_of_day, p.dow AS dow, p.weekday AS weekday, p.day_type AS day_type, w.stop_sequence AS stop_sequence, w.stop_id AS source_stop_id,
            w.stop_name AS stop_name, w.node_index AS stop_node_index,
            w.stop_lat AS stop_node_latitude, w.stop_lon AS stop_node_longitude
        FROM positions AS p
        INNER JOIN eta.curr_waypoints_snapped AS w FINAL ON w.hashed_trip_id = p.hashed_trip_id
            AND w.hashed_shape_id = p.hashed_shape_id
        WHERE w.node_index >= p.current_node_index
    ),
    estimates AS (
        SELECT u.ride_id AS ride_id, u.vehicle_id AS vehicle_id, u.hashed_shape_id AS hashed_shape_id, u.current_node_index AS current_node_index, u.position_received_at AS position_received_at, u.position_created_at AS position_created_at, u.trip_id AS trip_id, u.agency_id AS agency_id, u.plan_id AS plan_id, u.route_id AS route_id, u.hashed_trip_id AS hashed_trip_id, u.operational_date AS operational_date, u.current_node_latitude AS current_node_latitude, u.current_node_longitude AS current_node_longitude, u.local_hour AS local_hour, u.period_of_day AS period_of_day, u.dow AS dow, u.weekday AS weekday, u.day_type AS day_type, u.stop_sequence AS stop_sequence, u.source_stop_id AS source_stop_id, u.stop_name AS stop_name, u.stop_node_index AS stop_node_index, u.stop_node_latitude AS stop_node_latitude, u.stop_node_longitude AS stop_node_longitude,
            if(u.stop_node_index = u.current_node_index, 0., coalesce(c.seconds, 0.) +
                greatest(toInt64(0), toInt64(u.stop_node_index) - coalesce(toInt64(c.node_index), toInt64(u.current_node_index))) * 25. / 4.) AS raw_seconds,
            least(1., coalesce(c.known_nodes / nullIf(toFloat64(u.stop_node_index - u.current_node_index), 0.), 0.)) AS history_coverage,
            greatest(0., (now_ms - u.position_created_at) / 1000.) AS gps_age_seconds,
            (0.4 + 0.6 * history_coverage) * exp(-gps_age_seconds / 120.) AS prediction_confidence,
            if(gps_age_seconds <= (SELECT fresh_gps_seconds FROM eta.policy), 'fresh', 'aging') AS freshness_tier,
            greatest(if(u.stop_node_index > u.current_node_index, 1., 0.),
                raw_seconds - least(gps_age_seconds, (SELECT max_extrapolation_seconds FROM eta.policy)) *
                    exp(-gps_age_seconds / 120.)) AS remaining_seconds
        FROM upcoming AS u
        ASOF LEFT JOIN cumulative AS c ON c.ride_id = u.ride_id AND c.vehicle_id = u.vehicle_id
            AND c.node_index <= u.stop_node_index
    ),
    go_stop_map AS (
        SELECT w.hashed_trip_id AS hashed_trip_id, w.stop_sequence AS stop_sequence,
            argMin(s.go_stop_id, tuple(s.go_stop_id != w.stop_id,
                greatCircleDistance(w.stop_lon, w.stop_lat, s.longitude, s.latitude), s.go_stop_id)) AS go_stop_id
        FROM eta.curr_waypoints_snapped AS w FINAL
        INNER JOIN (
            SELECT _id AS go_stop_id, latitude, longitude,
                arrayJoin(arrayDistinct(arrayConcat([_id], legacy_ids))) AS source_stop_id
            FROM infrastructure.simplified_stops FINAL WHERE NOT is_deleted
        ) AS s ON s.source_stop_id = w.stop_id
        WHERE w.stop_id != '' GROUP BY w.hashed_trip_id, w.stop_sequence
    )
SELECT
    e.ride_id AS ride_id, e.route_id AS route_id, e.operational_date AS operational_date,
    e.position_received_at AS position_received_at, e.trip_id AS trip_id,
    e.agency_id AS agency_id, e.plan_id AS plan_id, e.vehicle_id AS vehicle_id,
    e.hashed_trip_id AS hashed_trip_id, e.hashed_shape_id AS hashed_shape_id,
    e.current_node_index AS current_node_index,
    e.current_node_latitude AS current_node_latitude, e.current_node_longitude AS current_node_longitude,
    e.position_created_at AS position_created_at, e.stop_sequence AS stop_sequence,
    coalesce(nullIf(g.go_stop_id, ''), e.source_stop_id) AS stop_id, e.stop_name AS stop_name,
    e.stop_node_index AS stop_node_index,
    e.stop_node_latitude AS stop_node_latitude, e.stop_node_longitude AS stop_node_longitude,
    if(isFinite(e.remaining_seconds) AND e.remaining_seconds BETWEEN 0 AND 65535,
       toUInt16(ceil(e.remaining_seconds)), NULL) AS eta_seconds,
    if(eta_seconds IS NULL, NULL, now_ms + toInt64(eta_seconds) * 1000) AS eta_at,
    eta_at AS baseline_eta_at,
    e.history_coverage AS history_coverage,
    e.prediction_confidence AS prediction_confidence, e.freshness_tier AS freshness_tier,
    'statistical-lifecycle-v4' AS prediction_version, now_ms AS refreshed_at
FROM estimates AS e
LEFT JOIN go_stop_map AS g ON g.hashed_trip_id = e.hashed_trip_id AND g.stop_sequence = e.stop_sequence
SETTINGS join_use_nulls = 1;

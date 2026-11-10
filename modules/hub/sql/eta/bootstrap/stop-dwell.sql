CREATE OR REPLACE MATERIALIZED VIEW eta.mv_stop_dwell_labels
REFRESH EVERY 1 MINUTE APPEND TO eta.stop_dwell_labels AS
WITH
    toUnixTimestamp64Milli(now64(3)) AS now_ms,
    events AS (
        SELECT *, lagInFrame(toNullable(created_at)) OVER (
            PARTITION BY ride_id, vehicle_id ORDER BY created_at, _id) AS prev_at
        FROM eta.curr_vehicle_events FINAL WHERE created_at >= now_ms - 2 * 3600000
    ),
    occupancy AS (
        SELECT a.ride_id AS ride_id, a.vehicle_id AS vehicle_id, a.stop_sequence AS stop_sequence,
            r.hashed_trip_id AS hashed_trip_id, r.hashed_shape_id AS hashed_shape_id,
            w.stop_id AS stop_id, w.node_index AS node_index, a.arrival_at AS arrival_at,
            max(e.created_at) AS last_stopped_at, count() AS samples,
            max(e.created_at - e.prev_at) AS max_gap_ms
        FROM eta.actual_arrivals AS a FINAL
        INNER JOIN eta.curr_rides AS r FINAL ON r._id = a.ride_id
        INNER JOIN eta.curr_waypoints_snapped AS w FINAL
            ON w.hashed_trip_id = r.hashed_trip_id AND w.stop_sequence = a.stop_sequence
        INNER JOIN events AS e ON e.ride_id = a.ride_id AND e.vehicle_id = a.vehicle_id
        WHERE a.arrival_at IS NOT NULL AND a.confidence >= 0.7
          AND e.created_at BETWEEN a.arrival_at - 30000 AND a.arrival_at + 300000
          AND e.speed <= 3 AND e.match_confidence >= 0.2
          AND abs(toInt64(e.node_index) - toInt64(w.node_index)) <= 1
          AND greatCircleDistance(e.longitude, e.latitude, w.stop_lon, w.stop_lat) <= 25.
        GROUP BY a.ride_id, a.vehicle_id, a.stop_sequence, r.hashed_trip_id,
            r.hashed_shape_id, w.stop_id, w.node_index, a.arrival_at
    ),
    gps AS (
        SELECT o.ride_id AS ride_id, o.vehicle_id AS vehicle_id, o.stop_sequence AS stop_sequence,
            o.hashed_trip_id AS hashed_trip_id, o.hashed_shape_id AS hashed_shape_id,
            o.stop_id AS stop_id, o.node_index AS node_index, toInt64(o.arrival_at) AS arrival_at,
            minOrNull(e.created_at) AS departure_at,
            if(departure_at IS NOT NULL AND o.samples >= 2 AND o.max_gap_ms <= 60000
                AND departure_at - arrival_at BETWEEN 10000 AND 300000,
                (departure_at - arrival_at) / 1000., NULL) AS dwell_seconds,
            'gps_occupancy' AS source, if(dwell_seconds IS NULL, 0.3, 0.8) AS confidence,
            if(dwell_seconds IS NULL, 'uncertain', 'observed') AS status, now_ms AS known_at
        FROM occupancy AS o
        LEFT JOIN events AS e ON e.ride_id = o.ride_id AND e.vehicle_id = o.vehicle_id
            AND e.created_at > o.last_stopped_at AND e.created_at <= o.last_stopped_at + 120000
            AND e.node_index > o.node_index + 1 AND e.speed >= 5
            AND e.created_at <= now_ms - 120000
        GROUP BY o.ride_id, o.vehicle_id, o.stop_sequence, o.hashed_trip_id,
            o.hashed_shape_id, o.stop_id, o.node_index, o.arrival_at, o.samples, o.max_gap_ms
    ),
    candidates AS (
        SELECT *, toUInt8(0) AS priority FROM gps
        WHERE (ride_id, vehicle_id, stop_sequence) NOT IN (
            SELECT ride_id, vehicle_id, stop_sequence FROM eta.stop_dwell_labels FINAL WHERE source = 'verified_door')
        UNION ALL
        SELECT a.ride_id, a.vehicle_id, a.stop_sequence, r.hashed_trip_id, r.hashed_shape_id,
            w.stop_id, w.node_index, toInt64(a.arrival_at), a.departure_at,
            (a.departure_at - a.arrival_at) / 1000., 'verified_door', a.confidence,
            'observed', now_ms, toUInt8(1)
        FROM eta.actual_arrivals AS a FINAL
        INNER JOIN eta.curr_rides AS r FINAL ON r._id = a.ride_id
        INNER JOIN eta.curr_waypoints_snapped AS w FINAL
            ON w.hashed_trip_id = r.hashed_trip_id AND w.stop_sequence = a.stop_sequence
        WHERE a.status = 'verified' AND a.confidence >= 0.8
          AND a.departure_at - a.arrival_at BETWEEN 0 AND 300000
          AND a.departure_at <= now_ms - 120000
    )
SELECT * EXCEPT priority FROM candidates
WHERE (ride_id, vehicle_id, stop_sequence, ifNull(departure_at, 0), source) NOT IN (
    SELECT ride_id, vehicle_id, stop_sequence, ifNull(departure_at, 0), source FROM eta.stop_dwell_labels FINAL)
ORDER BY priority DESC LIMIT 1 BY ride_id, vehicle_id, stop_sequence
SETTINGS join_use_nulls = 1;

CREATE OR REPLACE MATERIALIZED VIEW eta.mv_stop_dwell_model
REFRESH EVERY 15 MINUTE TO eta.stop_dwell_model AS
SELECT hashed_trip_id, stop_sequence,
    multiIf(toHour(fromUnixTimestamp64Milli(arrival_at, 'Europe/Lisbon')) BETWEEN 7 AND 9, 'Peak AM',
            toHour(fromUnixTimestamp64Milli(arrival_at, 'Europe/Lisbon')) BETWEEN 10 AND 16, 'Mid',
            toHour(fromUnixTimestamp64Milli(arrival_at, 'Europe/Lisbon')) BETWEEN 17 AND 19, 'Peak PM', 'Off Peak') AS period_of_day,
    medianExact(dwell_seconds) AS median_seconds, quantileExact(0.9)(dwell_seconds) AS p90_seconds,
    toUInt32(uniqExact(ride_id)) AS independent_rides, toUnixTimestamp64Milli(now64(3)) AS refreshed_at
FROM eta.stop_dwell_labels FINAL
WHERE status = 'observed' AND confidence >= 0.8 AND dwell_seconds BETWEEN 0 AND 300
  AND arrival_at >= toUnixTimestamp64Milli(now64(3)) - 30 * 86400000
GROUP BY hashed_trip_id, stop_sequence, period_of_day;

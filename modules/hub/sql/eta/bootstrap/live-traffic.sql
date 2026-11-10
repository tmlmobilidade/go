CREATE TABLE IF NOT EXISTS eta.traffic_vehicle_observations
(
    segment_id String, vehicle_id String, ratio Float64,
    traversal_samples UInt32, last_observed_at Int64,
    confidence Float64, known_at Int64
)
ENGINE = MergeTree ORDER BY (segment_id, vehicle_id);

CREATE OR REPLACE MATERIALIZED VIEW eta.mv_traffic_vehicle_observations
REFRESH EVERY 30 SECOND TO eta.traffic_vehicle_observations AS
WITH
    toUnixTimestamp64Milli(now64(3)) AS now_ms,
    steps AS (
        SELECT *,
            lagInFrame(toNullable(node_index)) OVER w AS prev_node,
            lagInFrame(toNullable(created_at)) OVER w AS prev_at,
            lagInFrame(speed) OVER w AS prev_speed
        FROM eta.valid_vehicle_events
        WHERE created_at >= now_ms - 600000 AND created_at <= now_ms
        WINDOW w AS (PARTITION BY ride_id, vehicle_id, hashed_shape_id ORDER BY created_at, _id)
    ),
    dwell_by_ride AS (
        SELECT ride_id, groupArray(tuple(arrival_at, assumeNotNull(departure_at))) AS intervals
        FROM eta.stop_dwell_labels FINAL
        WHERE status = 'observed' AND confidence >= 0.8 AND departure_at IS NOT NULL
          AND departure_at >= now_ms - 600000
        GROUP BY ride_id
    ),
    observed_steps AS (
        SELECT toJSONString(tuple(s.agency_id, s.vehicle_id)) AS vehicle_id, m.segment_id AS segment_id,
            s.created_at AS observed_at, s._id AS event_id,
            any(s.position_confidence) AS confidence,
            (s.created_at - s.prev_at) / 1000. * count() /
                (s.node_index - s.prev_node) AS observed_seconds,
            sum(p.predicted_travel_time_seconds) AS expected_seconds
        FROM steps AS s
        LEFT JOIN dwell_by_ride AS dwell ON dwell.ride_id = s.ride_id
        INNER JOIN eta.shape_node_road_segments AS m
            ON m.hashed_shape_id = s.hashed_shape_id
            AND m.node_index > s.prev_node AND m.node_index <= s.node_index
        INNER JOIN eta.curr_rides AS r FINAL ON r._id = s.ride_id
        INNER JOIN eta.pred_node_etas AS p FINAL
            ON p.hashed_shape_id = s.hashed_shape_id AND p.node_index = m.node_index
            AND p.weekday = arrayElement(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
                toDayOfWeek(toDate(fromUnixTimestamp64Milli(s.created_at, 'Europe/Lisbon') - INTERVAL 4 HOUR)))
            AND p.period_of_day = multiIf(
                toHour(fromUnixTimestamp64Milli(s.created_at, 'Europe/Lisbon')) BETWEEN 7 AND 9, 'Peak AM',
                toHour(fromUnixTimestamp64Milli(s.created_at, 'Europe/Lisbon')) BETWEEN 10 AND 16, 'Mid',
                toHour(fromUnixTimestamp64Milli(s.created_at, 'Europe/Lisbon')) BETWEEN 17 AND 19, 'Peak PM', 'Off Peak')
        WHERE s.node_index > s.prev_node AND s.created_at > s.prev_at
          AND s.created_at - s.prev_at <= 120000
          AND (s.node_index - s.prev_node) * 25. / ((s.created_at - s.prev_at) / 1000.) BETWEEN 1 AND 33.34
          AND s.speed >= 5 AND s.prev_speed >= 5
          AND NOT arrayExists(x -> x.1 < s.created_at AND x.2 > s.prev_at, dwell.intervals)
          AND p.effective_sample_count > 0 AND p.predicted_travel_time_seconds > 0
        GROUP BY s.agency_id, s.vehicle_id, m.segment_id, s.created_at, s._id, s.prev_at, s.node_index, s.prev_node
    )
SELECT segment_id, vehicle_id,
    medianExact(observed_seconds / expected_seconds) AS ratio,
    toUInt32(count()) AS traversal_samples, max(observed_at) AS last_observed_at,
    avg(confidence) AS confidence, now_ms AS known_at
FROM observed_steps
WHERE expected_seconds > 0 AND isFinite(observed_seconds / expected_seconds)
  AND observed_seconds / expected_seconds BETWEEN 0.3 AND 5.
GROUP BY segment_id, vehicle_id;

CREATE TABLE IF NOT EXISTS eta.live_traffic_factors
(
    segment_id String, raw_ratio Float64, independent_vehicles UInt32,
    confidence Float64, last_observed_at Int64, refreshed_at Int64
)
ENGINE = MergeTree ORDER BY segment_id;

CREATE OR REPLACE MATERIALIZED VIEW eta.mv_live_traffic_factors
REFRESH EVERY 30 SECOND DEPENDS ON eta.mv_traffic_vehicle_observations
TO eta.live_traffic_factors AS
SELECT segment_id, greatest(0.5, least(3., medianExact(ratio))) AS raw_ratio,
    toUInt32(uniqExact(vehicle_id)) AS independent_vehicles,
    if(independent_vehicles >= 2,
       independent_vehicles / (independent_vehicles + 3.) * least(1., greatest(0., avg(confidence))), 0.) AS confidence,
    max(last_observed_at) AS last_observed_at,
    toUnixTimestamp64Milli(now64(3)) AS refreshed_at
FROM eta.traffic_vehicle_observations
GROUP BY segment_id;

-- Decay on READ too: a stalled refresh cannot freeze congestion indefinitely.
CREATE OR REPLACE VIEW eta.current_traffic_factors AS
WITH toUnixTimestamp64Milli(now64(3)) AS now_ms
SELECT segment_id, independent_vehicles, last_observed_at, refreshed_at,
    confidence * exp(-greatest(0., (now_ms - last_observed_at) / 1000.) / 120.) AS current_confidence,
    if(now_ms - refreshed_at <= 90000 AND now_ms >= last_observed_at,
       1. + current_confidence * (raw_ratio - 1.), 1.) AS factor
FROM eta.live_traffic_factors;

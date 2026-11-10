-- Optional authoritative vehicle/door observations. Adapters must supply the
-- actual ride and stop sequence; GTFS-RT predicted arrivals are NOT valid input.
CREATE TABLE IF NOT EXISTS eta.verified_stop_events
(
    ride_id String, vehicle_id String, stop_sequence UInt16,
    arrival_at Int64, departure_at Nullable(Int64), received_at Int64,
    source LowCardinality(String), confidence Float64
)
ENGINE = ReplacingMergeTree(received_at)
ORDER BY (ride_id, vehicle_id, stop_sequence)
TTL fromUnixTimestamp64Milli(arrival_at, 'UTC') + INTERVAL 35 DAY;

CREATE TABLE IF NOT EXISTS eta.actual_arrivals
(
    ride_id String, vehicle_id String, stop_sequence UInt16,
    source_stop_id String, arrival_at Nullable(Int64),
    departure_at Nullable(Int64), known_at Int64,
    source LowCardinality(String), confidence Float64,
    status LowCardinality(String), label_version UInt16
)
ENGINE = ReplacingMergeTree(known_at)
ORDER BY (ride_id, vehicle_id, stop_sequence, label_version)
TTL fromUnixTimestamp64Milli(known_at, 'UTC') + INTERVAL 35 DAY;

CREATE OR REPLACE MATERIALIZED VIEW eta.mv_actual_arrivals
REFRESH EVERY 1 MINUTE APPEND TO eta.actual_arrivals AS
WITH
    toUnixTimestamp64Milli(now64(3)) AS now_ms,
    events AS (
        SELECT *,
            lagInFrame(toNullable(node_index)) OVER w AS prev_node,
            lagInFrame(toNullable(created_at)) OVER w AS prev_at
        FROM eta.curr_vehicle_events FINAL
        WHERE created_at >= now_ms - 2 * 3600000
        WINDOW w AS (PARTITION BY agency_id, trip_id, vehicle_id, hashed_shape_id
                     ORDER BY created_at, _id)
    ),
    crossings AS (
        SELECT
            r._id AS ride_id, e.vehicle_id AS vehicle_id,
            w.stop_sequence AS stop_sequence, w.stop_id AS source_stop_id,
            -- Interpolate only an observed, plausible forward crossing. A gap
            -- or reversal remains unobservable instead of a fabricated arrival.
            e.created_at - e.prev_at AS gap_ms,
            e.node_index - e.prev_node AS node_delta,
            gap_ms > 0 AND gap_ms <= 120000
                AND node_delta * 25. / (gap_ms / 1000.) <= 33.34 AS valid,
            if(valid,
                toNullable(toInt64(e.prev_at + gap_ms *
                    (w.node_index - e.prev_node) / node_delta)), NULL) AS crossing_at
        FROM events AS e
        INNER JOIN eta.curr_rides AS r FINAL
            ON e.trip_id = r.trip_id AND e.agency_id = r.agency_id
            AND e.hashed_shape_id = r.hashed_shape_id
        INNER JOIN eta.curr_waypoints_snapped AS w FINAL
            ON w.hashed_trip_id = r.hashed_trip_id
            AND w.hashed_shape_id = e.hashed_shape_id
        WHERE e.prev_node IS NOT NULL AND e.prev_at IS NOT NULL
          AND e.node_index > e.prev_node
          AND e.prev_node < w.node_index AND w.node_index <= e.node_index
          AND e.created_at <= now_ms - 120000
          AND e.created_at >= r.start_time_scheduled - 3600000
          AND e.created_at <= r.end_time_scheduled + 4 * 3600000
          AND toYYYYMMDD(toDate(fromUnixTimestamp64Milli(e.created_at, 'Europe/Lisbon')
                               - INTERVAL 4 HOUR)) = r.operational_date
    ),
    gps AS (
        SELECT ride_id, vehicle_id, stop_sequence, any(source_stop_id) AS source_stop_id,
            min(crossing_at) AS arrival_at,
            CAST(NULL, 'Nullable(Int64)') AS departure_at,
            now_ms AS known_at, 'gps_crossing' AS source,
            if(countIf(valid) > 0, 0.7, 0.) AS confidence,
            if(countIf(valid) > 0, 'crossing_only', 'unobservable') AS status,
            toUInt16(1) AS label_version
        FROM crossings
        WHERE (ride_id, vehicle_id, stop_sequence) NOT IN (
            SELECT ride_id, vehicle_id, stop_sequence FROM eta.actual_arrivals FINAL
            WHERE confidence >= 0.7 AND label_version = 1
        )
        GROUP BY ride_id, vehicle_id, stop_sequence
    ),
    candidates AS (
        SELECT *, toUInt8(0) AS priority FROM gps
        UNION ALL
        SELECT ride_id, vehicle_id, stop_sequence, '' AS source_stop_id,
            toNullable(arrival_at) AS arrival_at, departure_at,
            greatest(received_at, now_ms) AS known_at, source,
            least(1., greatest(0., confidence)) AS confidence,
            'verified' AS status, toUInt16(1) AS label_version, toUInt8(1) AS priority
        FROM eta.verified_stop_events FINAL
        WHERE received_at >= now_ms - 2 * 3600000
          AND arrival_at <= now_ms - 120000
          AND confidence >= 0.8
    )
SELECT * EXCEPT priority
FROM candidates
WHERE (ride_id, vehicle_id, stop_sequence, ifNull(arrival_at, 0),
       ifNull(departure_at, 0), status, source) NOT IN (
    SELECT ride_id, vehicle_id, stop_sequence, ifNull(arrival_at, 0),
           ifNull(departure_at, 0), status, source
    FROM eta.actual_arrivals FINAL WHERE label_version = 1
)
ORDER BY priority DESC, confidence DESC
LIMIT 1 BY ride_id, vehicle_id, stop_sequence, label_version;

-- Deduplicate generation retries before joining independent labels. Coverage
-- includes unmatched/suppressed rows in its denominator; errors do not.
CREATE OR REPLACE VIEW eta.prediction_errors AS
WITH snapshots AS (
    SELECT * FROM eta.prediction_snapshots
    ORDER BY captured_at DESC
    LIMIT 1 BY ride_id, vehicle_id, stop_sequence, generated_at, prediction_version
)
SELECT p.*,
    a.arrival_at AS actual_arrival_at, a.known_at AS label_known_at,
    a.confidence AS label_confidence, a.label_version AS label_version,
    a.status AS label_status,
    a.arrival_at IS NOT NULL AND a.confidence >= 0.7
        AND p.generated_at < a.arrival_at AS has_label,
    if(has_label AND p.eta_at IS NOT NULL,
       (p.eta_at - a.arrival_at) / 1000., NULL) AS signed_error_seconds
FROM snapshots AS p
LEFT JOIN eta.actual_arrivals AS a FINAL
    ON a.ride_id = p.ride_id AND a.vehicle_id = p.vehicle_id
    AND a.stop_sequence = p.stop_sequence AND a.label_version = 1
SETTINGS join_use_nulls = 1;

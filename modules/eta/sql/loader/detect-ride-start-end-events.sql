-- Detect ride start_time_observed / end_time_observed via stop-coordinate geofences.
--
-- Independent re-implementation of the rides-controller JS detection, expressed
-- entirely in ClickHouse SQL. No dependency on the rides-controller package.
-- Mirrors the per-ride model in temp.sql, generalised to a BATCH of rides.
--
-- Algorithm per ride (BUFFER_RADIUS_M buffer, great-circle distance):
--   departure        = first event OUTSIDE the first-stop buffer
--                      (minIf(created_at, dist_first > radius))
--   start_time_observed = last event INSIDE the first-stop buffer that occurs
--                      BEFORE departure
--                      (maxIf(created_at, dist_first <= radius AND created_at < departure))
--                      FALLBACK: if no such event exists, the first event of the
--                      ride overall (min created_at across the full ride window,
--                      not restricted to the geohash candidate pool).
--   end_time_observed   = first event INSIDE the last-stop buffer that occurs
--                      AFTER departure
--                      (minIf(created_at, dist_last <= radius AND created_at > departure))
--                      FALLBACK: if no such event exists, the last event of the
--                      ride overall (max created_at across the full ride window,
--                      not restricted to the geohash candidate pool).
--
-- Events come from operation.simplified_vehicle_events (the raw source), because
-- this step runs BEFORE hist_vehicle_events is populated (which itself depends on
-- the observed times computed here).
--
-- This statement processes ONE BATCH of rides. The batch's ride ids are staged in
-- {database}._detect_hist_rides_batch (column _id String). Detected values are
-- written into {database}._detect_hist_rides_values (Join engine, _id String,
-- start_time_observed Nullable(UInt64), end_time_observed Nullable(UInt64)); a
-- subsequent ALTER TABLE ... UPDATE applies them in place to hist_rides via joinGet.
--
-- PERFORMANCE: the candidate pool is pruned by the source table's natural order
-- (agency_id, trip_id) plus a created_at window, then restricted to events whose
-- geohash shares the 6-char prefix of either stop's geohash (a geohash-7 cell and
-- its neighbours). Mid-route events are dropped before any distance maths.
--
-- Params:
--   {buffer_radius_m}        Float64 geofence radius in meters (e.g. 50)
--   {geohash_prefix_len}     UInt8   geohash prefix length for the candidate filter (e.g. 6)
--   {ride_window_pre_ms}     UInt64  ms before scheduled start to start scanning events
--   {ride_window_post_ms}    UInt64  ms after  scheduled start to stop  scanning events

INSERT INTO {database}._detect_hist_rides_values
WITH
    -- Only the rides in this batch (staged ids). first_stop_coordinates /
    -- last_stop_coordinates are Tuple(lat, lon): .1 = lat, .2 = lon.
    rides AS (
        SELECT
            hr._id AS ride_id,
            hr.agency_id,
            hr.trip_id,
            hr.start_time_scheduled,
            hr.first_stop_coordinates.1  AS first_stop_lat,
            hr.first_stop_coordinates.2  AS first_stop_lon,
            hr.last_stop_coordinates.1   AS last_stop_lat,
            hr.last_stop_coordinates.2   AS last_stop_lon,
            substring(hr.first_stop_geohash, 1, {geohash_prefix_len}) AS first_stop_geohash_prefix,
            substring(hr.last_stop_geohash,  1, {geohash_prefix_len}) AS last_stop_geohash_prefix
        FROM {database}.hist_rides AS hr
        INNER JOIN {database}._detect_hist_rides_batch AS b
            ON hr._id = b._id
    ),
    -- Candidate events: matched to a ride by agency_id + trip_id within the time
    -- window, and spatially restricted to the geohash prefix of either stop. Each
    -- candidate carries its distance to both stops.
    candidates AS (
        SELECT
            r.ride_id                                       AS ride_id,
            sve.created_at                                  AS created_at,
            greatCircleDistance(sve.longitude, sve.latitude, r.first_stop_lon, r.first_stop_lat) AS dist_first,
            greatCircleDistance(sve.longitude, sve.latitude, r.last_stop_lon,  r.last_stop_lat)  AS dist_last
        FROM operation.simplified_vehicle_events AS sve
        INNER JOIN rides AS r
            ON sve.agency_id = r.agency_id
            AND sve.trip_id  = r.trip_id
        WHERE
            sve.created_at >= (SELECT min(start_time_scheduled) - {ride_window_pre_ms} FROM rides)
            AND sve.created_at <= (SELECT max(start_time_scheduled) + {ride_window_post_ms} FROM rides)
            AND sve.created_at > (r.start_time_scheduled - {ride_window_pre_ms})
            AND sve.created_at < (r.start_time_scheduled + {ride_window_post_ms})
            AND (
                startsWith(sve.geohash, r.first_stop_geohash_prefix)
                OR startsWith(sve.geohash, r.last_stop_geohash_prefix)
            )
    ),
    -- Per-ride departure: the first event outside the first-stop buffer.
    departure AS (
        SELECT
            ride_id,
            minIf(created_at, dist_first > {buffer_radius_m}) AS departure_time
        FROM candidates
        GROUP BY ride_id
    ),
    -- Per-ride start/end derived against the ride's departure time. The end has a
    -- fallback (handled in the final SELECT) to the last event of the ride.
    detected AS (  
        SELECT  
            c.ride_id AS ride_id,  
            maxIf(c.created_at, c.dist_first <= {buffer_radius_m} AND d.departure_time > 0 AND c.created_at < d.departure_time) AS start_time_observed_new,  
            minIf(c.created_at, c.dist_last  <= {buffer_radius_m} AND d.departure_time > 0 AND c.created_at > d.departure_time) AS end_time_observed_new  
        FROM candidates AS c  
        INNER JOIN departure AS d  
            ON c.ride_id = d.ride_id  
        GROUP BY c.ride_id  
    ),
    -- Per-ride first/last event over the FULL ride window (no geohash restriction).
    -- Used as fallbacks: the first event when no first-stop arrival is detected,
    -- the last event when no last-stop arrival is detected.
    ride_event_bounds AS (
        SELECT
            r.ride_id              AS ride_id,
            min(sve.created_at)    AS first_event_time,
            max(sve.created_at)    AS last_event_time
        FROM operation.simplified_vehicle_events AS sve
        INNER JOIN rides AS r
            ON sve.agency_id = r.agency_id
            AND sve.trip_id  = r.trip_id
        WHERE
            sve.created_at > (r.start_time_scheduled - {ride_window_pre_ms})
            AND sve.created_at < (r.start_time_scheduled + {ride_window_post_ms})
        GROUP BY r.ride_id
    )
SELECT
    r.ride_id AS _id,
    -- Start: detected first-stop departure anchor, else fall back to the ride's
    -- first event. A missing match leaves the aggregate default 0.
    if(
        det.start_time_observed_new > 0,
        det.start_time_observed_new,
        if(reb.first_event_time > 0, reb.first_event_time, NULL)
    ) AS start_time_observed,
    -- End: detected last-stop arrival, else fall back to the ride's last event.
    if(
        det.end_time_observed_new > 0,
        det.end_time_observed_new,
        if(reb.last_event_time > 0, reb.last_event_time, NULL)
    ) AS end_time_observed
FROM rides AS r
LEFT JOIN detected AS det
    ON r.ride_id = det.ride_id
LEFT JOIN ride_event_bounds AS reb
    ON r.ride_id = reb.ride_id
SETTINGS join_algorithm = 'auto';

-- =============================================================================
-- Snaps every daily waypoint stop to the nearest node on its trip's shape.
-- Source: eta.curr_waypoints    (stop lat/lon)
--         eta.curr_rides        (trip -> hashed_shape_id assignment)
--         eta.hist_shape_nodes  (per-shape node geometry)
-- Target: eta.curr_waypoints_snapped
--
-- Runs every loader cycle after curr_rides, curr_waypoints and hist_shape_nodes
-- are up to date, and only snaps trips not yet present (a trip's snapped stops
-- never change). The snapped table feeds eta.mv_pred_trip_stop_etas so live ETAs
-- can resolve stop -> node_index in O(1).
-- =============================================================================

INSERT INTO eta.curr_waypoints_snapped
SELECT
    w._id                                                               AS hashed_trip_id,
    d.hashed_shape_id                                                   AS hashed_shape_id,
    w.stop_sequence                                                     AS stop_sequence,
    w.stop_id                                                           AS stop_id,
    w.stop_name                                                         AS stop_name,
    w.stop_lat                                                          AS stop_lat,
    w.stop_lon                                                          AS stop_lon,
    -- Nearest node on the trip's shape (stops are few per trip, so the full-shape
    -- argMin is cheap here; pings use the geohash-bucketed variant).
    argMin(n.node_index,
           greatCircleDistance(w.stop_lon, w.stop_lat, n.longitude, n.latitude)) AS node_index,
    w.arrival_time                                                      AS arrival_time,
    w.departure_time                                                    AS departure_time
FROM eta.curr_waypoints AS w
INNER JOIN eta.curr_rides     AS d ON w._id = d.hashed_trip_id
INNER JOIN eta.hist_shape_nodes     AS n ON d.hashed_shape_id = n.hashed_shape_id
WHERE w._id NOT IN (SELECT DISTINCT hashed_trip_id FROM eta.curr_waypoints_snapped)
GROUP BY
    w._id,
    d.hashed_shape_id,
    w.stop_sequence,
    w.stop_id,
    w.stop_name,
    w.stop_lat,
    w.stop_lon,
    w.arrival_time,
    w.departure_time;

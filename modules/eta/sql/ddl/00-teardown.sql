-- Teardown: run for clean reset. Apply after dependent pipelines stopped.

-- Historical
DROP VIEW  IF EXISTS eta.mv_node_predictions;
DROP TABLE IF EXISTS eta.node_predictions;
DROP TABLE IF EXISTS eta.node_travel_times_aggregates;
DROP TABLE IF EXISTS eta.node_travel_times_samples;
DROP TABLE IF EXISTS eta.vehicle_events;
DROP TABLE IF EXISTS eta.shape_nodes;

-- Daily
DROP TABLE IF EXISTS eta.daily_rides;
DROP TABLE IF EXISTS eta.daily_rides_waypoints;
DROP TABLE IF EXISTS eta.daily_rides_waypoints_snapped;

-- Live
DROP VIEW  IF EXISTS eta.mv_live_trip_stop_etas;
DROP TABLE IF EXISTS eta.live_trip_stop_etas;
DROP TABLE IF EXISTS eta.live_vehicle_positions;
DROP VIEW  IF EXISTS eta.mv_live_snapper;

-- Uncomment only if you want to remove the whole database.
-- DROP DATABASE IF EXISTS eta;

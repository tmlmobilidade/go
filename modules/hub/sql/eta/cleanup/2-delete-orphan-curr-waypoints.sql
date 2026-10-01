-- Delete orphan waypoints from eta.curr_waypoints and eta.curr_waypoints_snapped.
--
-- An "orphan" is any row whose hashed trip id no longer exists as
-- `hashed_trip_id` in eta.curr_rides. curr_waypoints is cloned from
-- operation.hashed_trips, so its trip key column is `_id`.
--
-- Statement 1: preview count (both tables). Statements 2-3: delete.

SELECT
    (SELECT count() FROM eta.curr_waypoints
     WHERE _id NOT IN (SELECT DISTINCT hashed_trip_id FROM eta.curr_rides))
  + (SELECT count() FROM eta.curr_waypoints_snapped
     WHERE hashed_trip_id NOT IN (SELECT DISTINCT hashed_trip_id FROM eta.curr_rides))
  AS rows_to_delete;

ALTER TABLE eta.curr_waypoints
DELETE WHERE _id NOT IN (SELECT DISTINCT hashed_trip_id FROM eta.curr_rides);

ALTER TABLE eta.curr_waypoints_snapped
DELETE WHERE hashed_trip_id NOT IN (SELECT DISTINCT hashed_trip_id FROM eta.curr_rides);

-- Delete orphan waypoints from {database}.curr_waypoints.
-- An "orphan" waypoint is any record whose hashed_trip_id no longer exists in {database}.curr_rides.

-- Preview the number of orphan waypoints that will be deleted:
SELECT count() AS rows_to_delete FROM {database}.curr_waypoints
WHERE
    hashed_trip_id NOT IN (
        SELECT DISTINCT hashed_trip_id
        FROM {database}.curr_rides
    );

-- Delete all orphan waypoints from {database}.curr_waypoints:
ALTER TABLE {database}.curr_waypoints
DELETE WHERE hashed_trip_id NOT IN (
	SELECT DISTINCT hashed_trip_id
	FROM {database}.curr_rides
);

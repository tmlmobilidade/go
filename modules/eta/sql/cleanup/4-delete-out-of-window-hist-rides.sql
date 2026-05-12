-- Delete out-of-window historical rides from eta.hist_rides.
--
-- The cleaner mirrors the loader's historical fetch: for each `dayIndex` in
-- [0 .. historicalDataDaysBack) it pulls every ride from Mongo whose
-- `start_time_scheduled` falls inside that day's 3h window. The union of
-- those `_id` values is the set of rides currently considered in-window.
-- Any row in eta.hist_rides whose `_id` is NOT in that set is stale and
-- gets removed.
--
-- Parameters:
--   {keep_ride_ids:Array(String)} = list of historical ride `_id` values
--                                   that must be preserved.
--
-- Preview the number of historical rides that will be deleted:

SELECT count() AS rows_to_delete FROM eta.hist_rides
WHERE NOT has({keep_ride_ids:Array(String)}, _id);

-- Delete all out-of-window historical rides from eta.hist_rides:

ALTER TABLE eta.hist_rides
DELETE WHERE NOT has({keep_ride_ids:Array(String)}, _id);

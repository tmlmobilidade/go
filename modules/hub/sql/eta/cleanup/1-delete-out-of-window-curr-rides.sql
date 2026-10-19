-- Delete out-of-window rides from eta.curr_rides.
--
-- The cut-off is the loader's own current-window start
-- (now - standardWindowHours on start_time_scheduled), passed in by the app so
-- the cleaner can never delete a ride the loader is about to re-insert. Every
-- downstream live table (curr_vehicle_events, curr_waypoints*, the ETA views)
-- joins on curr_rides, so a ride must stay here until its window closes.
--
-- Parameters:
--   {window_start:Int64} = unix ms; rides with start_time_scheduled below this are dropped
--
-- Statement 1: preview count. Statement 2: delete (only run when the count is > 0).

SELECT count() AS rows_to_delete FROM eta.curr_rides
WHERE start_time_scheduled < {window_start:Int64};

ALTER TABLE eta.curr_rides
DELETE WHERE start_time_scheduled < {window_start:Int64};

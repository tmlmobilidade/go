-- Delete out-of-window historical rides from eta.hist_rides.
--
-- The cut-off is the loader's historical-window start on start_time_scheduled,
-- passed in by the app, so the two windows can never disagree. Rides that fall
-- out of the coverage-grade filter are never inserted in the first place, so a
-- time cut-off is all that is needed (no keep-list round trip).
--
-- Parameters:
--   {window_start:Int64} = unix ms; rides with start_time_scheduled below this are dropped
--
-- Statement 1: preview count. Statement 2: delete (only run when the count is > 0).

SELECT count() AS rows_to_delete FROM eta.hist_rides
WHERE start_time_scheduled < {window_start:Int64};

ALTER TABLE eta.hist_rides
DELETE WHERE start_time_scheduled < {window_start:Int64};

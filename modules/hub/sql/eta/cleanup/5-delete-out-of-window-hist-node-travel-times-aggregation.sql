-- Delete out-of-window rows from eta.hist_node_travel_times_aggregation.
--
-- The aggregation is re-inserted per operational day (ReplacingMergeTree), so
-- without pruning it keeps every day ever aggregated. Drop everything whose
-- `operational_date` (YYYYMMDD, Europe/Lisbon) is before the loader's
-- historical window.
--
-- Parameters:
--   {min_operational_date:UInt32} = first operational date to keep
--
-- Statement 1: preview count. Statement 2: delete (only run when the count is > 0).

SELECT count() AS rows_to_delete FROM eta.hist_node_travel_times_aggregation
WHERE operational_date < {min_operational_date:UInt32};

ALTER TABLE eta.hist_node_travel_times_aggregation
DELETE WHERE operational_date < {min_operational_date:UInt32};

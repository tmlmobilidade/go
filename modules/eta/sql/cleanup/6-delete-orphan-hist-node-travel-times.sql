-- Delete orphan rows from {database}.hist_node_travel_times.
--
-- An "orphan" row is any record whose `ride_id` no longer exists in
-- {database}.hist_rides. Once the historical rides cleanup has pruned stale
-- rides, every hist_node_travel_times row referencing one of those
-- gone rides becomes an orphan and should be removed.
--
-- Preview the number of orphan rows that will be deleted:

SELECT count() AS rows_to_delete FROM {database}.hist_node_travel_times
WHERE ride_id NOT IN (
    SELECT DISTINCT _id FROM {database}.hist_rides
);

-- Delete all orphan rows from {database}.hist_node_travel_times:

ALTER TABLE {database}.hist_node_travel_times
DELETE WHERE ride_id NOT IN (
    SELECT DISTINCT _id FROM {database}.hist_rides
);

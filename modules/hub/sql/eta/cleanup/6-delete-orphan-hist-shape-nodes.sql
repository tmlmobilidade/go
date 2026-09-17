-- Delete orphan shape nodes from eta.hist_shape_nodes.
--
-- Shape geometry is loaded once per hashed shape and never changes, so the only
-- reason to remove it is that no ride in either window references it any more.
-- This is rare (a network change), so the mutation almost never runs.
--
-- Guard: if either rides table is empty (fresh bootstrap, manual truncate, a
-- failed load) every shape would look orphaned, so nothing is deleted then.
--
-- Statement 1: preview count. Statement 2: delete (only run when the count is > 0).

SELECT count() AS rows_to_delete FROM eta.hist_shape_nodes
WHERE (SELECT count() FROM eta.hist_rides) > 0
  AND (SELECT count() FROM eta.curr_rides) > 0
  AND hashed_shape_id NOT IN (
    SELECT DISTINCT hashed_shape_id FROM eta.hist_rides
    UNION DISTINCT
    SELECT DISTINCT hashed_shape_id FROM eta.curr_rides
);

ALTER TABLE eta.hist_shape_nodes
DELETE WHERE (SELECT count() FROM eta.hist_rides) > 0
  AND (SELECT count() FROM eta.curr_rides) > 0
  AND hashed_shape_id NOT IN (
    SELECT DISTINCT hashed_shape_id FROM eta.hist_rides
    UNION DISTINCT
    SELECT DISTINCT hashed_shape_id FROM eta.curr_rides
);

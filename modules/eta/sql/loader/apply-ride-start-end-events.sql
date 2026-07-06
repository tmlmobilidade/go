-- Apply detected start/end observed times to hist_rides IN PLACE.
--
-- Companion to detect-ride-start-end-events.sql. The detect step wrote one row
-- per processed ride into {database}._detect_hist_rides_values, a Join-engine
-- table keyed on _id:
--   (_id String, start_time_observed Nullable(UInt64), end_time_observed Nullable(UInt64))
--   ENGINE = Join(ANY, LEFT, _id).
--
-- ClickHouse mutations cannot use correlated subqueries (a subquery in the SET
-- expression cannot reference the mutated table's columns) and cannot JOIN. The
-- supported way to pull per-row values from another table inside a mutation is
-- `joinGet`, which performs a key lookup against a Join-engine table -- exactly
-- what we need here, and it avoids re-inserting rows.
--
-- Scoped to the batch by `_id IN (SELECT _id FROM ...)` so only the rides
-- processed in this batch are mutated.

ALTER TABLE {database}.hist_rides
UPDATE
    start_time_observed = joinGet('{database}._detect_hist_rides_values', 'start_time_observed', _id),
    end_time_observed   = joinGet('{database}._detect_hist_rides_values', 'end_time_observed', _id)
WHERE _id IN (SELECT _id FROM {database}._detect_hist_rides_values);

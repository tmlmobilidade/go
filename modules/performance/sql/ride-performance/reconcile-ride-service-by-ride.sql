-- Purpose: diagnostic
-- Canonical table: performance.ride_service_by_ride
-- Safety: read-only
-- Used by runtime: no
--
-- A healthy result has zeroes in every difference column.
-- Replace the date before running.
WITH 20260817 AS target_date
SELECT
	source.source_rides - fact.fact_rows AS row_difference,
	fact.fact_rows - fact.unique_rides AS duplicate_fact_keys,
	source.source_rides - fact.scheduled_rides AS scheduled_total_difference
FROM (
	SELECT count() AS source_rides
	FROM operation.rides FINAL
	WHERE operational_date = target_date
) AS source
CROSS JOIN (
	SELECT
		count() AS fact_rows,
		uniqExact(tuple(definition_version, operational_date, ride_id)) AS unique_rides,
		sum(scheduled_rides_total_qty) AS scheduled_rides
	FROM performance.ride_service_by_ride
	WHERE definition_version = 'ride-performance-v1'
		AND operational_date = target_date
) AS fact;

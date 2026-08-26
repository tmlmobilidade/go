-- Replace the date before running.
WITH 20260817 AS target_date
SELECT
	data_status,
	count() AS fact_rows,
	uniqExact(ride_id) AS unique_rides,
	sum(scheduled_rides_total_qty) AS scheduled_rides,
	sum(scheduled_rides_until_cutoff_qty) AS service_eligible_rides,
	sum(observed_start_rides_qty) AS observed_start_rides,
	sum(combined_execution_failure_rides_qty) AS combined_failures,
	sum(delayed_more_than_five_minutes_rides_qty) AS late_starts,
	sum(advanced_rides_qty) AS early_starts,
	max(source_watermark) AS source_watermark,
	max(calculated_at) AS calculated_at
FROM performance.ride_service_by_ride
WHERE definition_version = 'ride-performance-v1'
	AND operational_date = target_date
GROUP BY data_status;

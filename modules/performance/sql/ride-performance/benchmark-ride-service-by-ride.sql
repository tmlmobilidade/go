-- Purpose: benchmark
-- Canonical table: performance.ride_service_by_ride
-- Safety: read-only
-- Used by runtime: no
--
-- Run with clickhouse-client --time to benchmark the canonical aggregate path.
-- Replace both dates before running.
SELECT
	agency_id,
	line_id,
	toDayOfWeek(fromUnixTimestamp64Milli(interval_start, 'Europe/Lisbon')) AS weekday,
	toHour(fromUnixTimestamp64Milli(interval_start, 'Europe/Lisbon')) AS scheduled_hour,
	sum(scheduled_rides_until_cutoff_qty) AS eligible_rides,
	sum(combined_execution_failure_rides_qty) AS failed_rides,
	sum(observed_start_rides_qty) AS observed_starts,
	sum(delayed_more_than_five_minutes_rides_qty) AS late_starts,
	sum(advanced_rides_qty) AS early_starts
FROM performance.ride_service_by_ride
WHERE definition_version = 'ride-performance-v1'
	AND operational_date BETWEEN 20260801 AND 20260814
GROUP BY agency_id, line_id, weekday, scheduled_hour
ORDER BY agency_id, line_id, weekday, scheduled_hour
FORMAT Null;

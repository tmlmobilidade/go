/*
 * Reconciles the rolling seven-operational-date window without mutating rows
 * in place. Run this file once for every YYYYMM partition touched by the
 * window, passing:
 *
 *   partition_month UInt32  -- for example 202608
 *   start_date      UInt32  -- oldest operational date in the window
 *   end_date        UInt32  -- newest operational date in the window
 *
 * The staging partition combines unchanged canonical rows outside the window
 * with freshly aggregated rows inside it. REPLACE PARTITION publishes that
 * month atomically and removes dimension keys that disappeared at the source.
 */

CREATE TABLE IF NOT EXISTS performance.passenger_demand_by_dimensions_by_day_recent_refresh
AS performance.passenger_demand_by_dimensions_by_day
ENGINE = MergeTree()
PARTITION BY intDiv(operational_date, 100)
ORDER BY
(
	definition_version,
	operational_date,
	agency_id,
	line_id,
	pattern_id,
	product_id,
	category
);

TRUNCATE TABLE performance.passenger_demand_by_dimensions_by_day_recent_refresh;

INSERT INTO performance.passenger_demand_by_dimensions_by_day_recent_refresh
SELECT *
FROM performance.passenger_demand_by_dimensions_by_day
WHERE
	intDiv(operational_date, 100) = {partition_month:UInt32}
	AND NOT (
		definition_version = 'passenger-demand-v2'
		AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
	);

INSERT INTO performance.passenger_demand_by_dimensions_by_day_recent_refresh
(
	accepted_validations_qty,
	agency_id,
	calculated_at,
	category,
	definition_version,
	line_id,
	operational_date,
	pattern_id,
	product_id,
	source_watermark
)
SELECT
	count() AS accepted_validations_qty,
	agency_id,
	toUnixTimestamp64Milli(now64(3)) AS calculated_at,
	if(empty(category), '__unknown__', category) AS category,
	'passenger-demand-v2' AS definition_version,
	ifNull(line_id, '__unknown__') AS line_id,
	operational_date,
	ifNull(pattern_id, '__unknown__') AS pattern_id,
	ifNull(product_id, '__unknown__') AS product_id,
	max(updated_at) AS source_watermark
FROM simplified_apex.validations FINAL
WHERE
	validation_status IN ('0', '4', '5', '6')
	AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
	AND intDiv(operational_date, 100) = {partition_month:UInt32}
GROUP BY
	operational_date,
	agency_id,
	line_id,
	pattern_id,
	product_id,
	category;

SELECT throwIf(
	(SELECT count()
	 FROM simplified_apex.validations FINAL
	 WHERE
		validation_status IN ('0', '4', '5', '6')
		AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
		AND intDiv(operational_date, 100) = {partition_month:UInt32})
	!=
	(SELECT coalesce(sum(accepted_validations_qty), 0)
	 FROM performance.passenger_demand_by_dimensions_by_day_recent_refresh
	 WHERE
		definition_version = 'passenger-demand-v2'
		AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
		AND intDiv(operational_date, 100) = {partition_month:UInt32}),
	'Passenger-demand recent refresh refused: source and staged totals differ.'
);

ALTER TABLE performance.passenger_demand_by_dimensions_by_day
REPLACE PARTITION {partition_month:UInt32}
FROM performance.passenger_demand_by_dimensions_by_day_recent_refresh;

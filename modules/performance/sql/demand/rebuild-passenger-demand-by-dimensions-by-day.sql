/*
 * Builds a complete replacement for
 * performance.passenger_demand_by_dimensions_by_day and publishes it with one
 * atomic metadata swap.
 *
 * The canonical table is created by @tmlmobilidade/go-interfaces-labdb. This
 * runbook assumes the performance database uses ClickHouse's Atomic engine so
 * EXCHANGE TABLES is atomic. Pass `source_cutoff UInt64`, captured once before
 * starting the run, so population and validation read the same source horizon.
 *
 * Keep the recent-window refresh paused while this file runs. After the swap,
 * the previous canonical table remains under the `_full_rebuild` name as a
 * rollback copy until the next full rebuild truncates it.
 */

SELECT throwIf(
	engine != 'Atomic',
	'Passenger-demand full rebuild requires the performance database to use Atomic.'
)
FROM system.databases
WHERE name = 'performance';

CREATE TABLE IF NOT EXISTS performance.passenger_demand_by_dimensions_by_day_full_rebuild
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

TRUNCATE TABLE performance.passenger_demand_by_dimensions_by_day_full_rebuild;

INSERT INTO performance.passenger_demand_by_dimensions_by_day_full_rebuild
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
	AND updated_at <= {source_cutoff:UInt64}
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
		AND updated_at <= {source_cutoff:UInt64}) = 0,
	'Passenger-demand full rebuild refused: the accepted source set is empty.'
);

SELECT throwIf(
	(SELECT count()
	 FROM simplified_apex.validations FINAL
	 WHERE
		validation_status IN ('0', '4', '5', '6')
		AND updated_at <= {source_cutoff:UInt64})
	!=
	(SELECT coalesce(sum(accepted_validations_qty), 0)
	 FROM performance.passenger_demand_by_dimensions_by_day_full_rebuild
	 WHERE definition_version = 'passenger-demand-v2'),
	'Passenger-demand full rebuild refused: source and staged totals differ.'
);

EXCHANGE TABLES
	performance.passenger_demand_by_dimensions_by_day
	AND performance.passenger_demand_by_dimensions_by_day_full_rebuild;

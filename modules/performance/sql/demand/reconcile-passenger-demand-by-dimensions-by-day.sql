/*
 * Reports any difference between accepted source validations and the stored
 * daily-dimensional fact for an inclusive operational-date range.
 *
 * An empty result means every dimension key and quantity reconciles. Run this
 * after the daily full rebuild and periodically against the rolling week.
 */

WITH
	source AS
	(
		SELECT
			agency_id,
			if(empty(category), '__unknown__', category) AS category,
			ifNull(line_id, '__unknown__') AS line_id,
			operational_date,
			ifNull(pattern_id, '__unknown__') AS pattern_id,
			ifNull(product_id, '__unknown__') AS product_id,
			count() AS source_qty
		FROM simplified_apex.validations FINAL
		WHERE
			validation_status IN ('0', '4', '5', '6')
			AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
		GROUP BY
			operational_date,
			agency_id,
			line_id,
			pattern_id,
			product_id,
			category
	),
	stored AS
	(
		SELECT
			agency_id,
			category,
			line_id,
			operational_date,
			pattern_id,
			product_id,
			sum(accepted_validations_qty) AS stored_qty
		FROM performance.passenger_demand_by_dimensions_by_day
		WHERE
			definition_version = 'passenger-demand-v2'
			AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
		GROUP BY
			operational_date,
			agency_id,
			line_id,
			pattern_id,
			product_id,
			category
	)
SELECT
	coalesce(source.operational_date, stored.operational_date) AS operational_date,
	coalesce(source.agency_id, stored.agency_id) AS agency_id,
	coalesce(source.line_id, stored.line_id) AS line_id,
	coalesce(source.pattern_id, stored.pattern_id) AS pattern_id,
	coalesce(source.product_id, stored.product_id) AS product_id,
	coalesce(source.category, stored.category) AS category,
	coalesce(source.source_qty, 0) AS source_qty,
	coalesce(stored.stored_qty, 0) AS stored_qty,
	toInt64(coalesce(source.source_qty, 0))
		- toInt64(coalesce(stored.stored_qty, 0)) AS difference
FROM source
FULL OUTER JOIN stored USING
(
	operational_date,
	agency_id,
	line_id,
	pattern_id,
	product_id,
	category
)
WHERE coalesce(source.source_qty, 0) != coalesce(stored.stored_qty, 0)
ORDER BY
	operational_date,
	agency_id,
	line_id,
	pattern_id,
	product_id,
	category;

/* * */

import { PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION } from './constants.js';

/* * */

const FACT_COLUMNS = `
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
`;

const AGGREGATED_FACT_SELECT = `
	SELECT
		count() AS accepted_validations_qty,
		agency_id,
		toUnixTimestamp64Milli(now64(3)) AS calculated_at,
		if(empty(category), '__unknown__', category) AS category,
		'${PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION}' AS definition_version,
		ifNull(line_id, '__unknown__') AS line_id,
		operational_date,
		ifNull(pattern_id, '__unknown__') AS pattern_id,
		ifNull(product_id, '__unknown__') AS product_id,
		max(updated_at) AS source_watermark
	FROM simplified_apex.validations FINAL
`;

const FACT_GROUPING = `
	GROUP BY
		operational_date,
		agency_id,
		line_id,
		pattern_id,
		product_id,
		category
`;

export const GET_PERFORMANCE_DATABASE_ENGINE_QUERY = `
	SELECT engine
	FROM system.databases
	WHERE name = 'performance'
`;

export const GET_FULL_REBUILD_RANGE_QUERY = `
	SELECT
		if(count() = 0, {fallback_date:UInt32}, min(operational_date)) AS range_start,
		if(count() = 0, {fallback_date:UInt32}, max(operational_date)) AS range_end
	FROM simplified_apex.validations FINAL
	WHERE
		validation_status IN ('0', '4', '5', '6')
		AND updated_at <= {source_cutoff:UInt64}
`;

export const CREATE_FULL_REBUILD_TABLE_QUERY = `
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
	)
`;

export const TRUNCATE_FULL_REBUILD_TABLE_QUERY = `
	TRUNCATE TABLE performance.passenger_demand_by_dimensions_by_day_full_rebuild
`;

export const POPULATE_FULL_REBUILD_TABLE_QUERY = `
	INSERT INTO performance.passenger_demand_by_dimensions_by_day_full_rebuild
	(${FACT_COLUMNS})
	${AGGREGATED_FACT_SELECT}
	WHERE
		validation_status IN ('0', '4', '5', '6')
		AND updated_at <= {source_cutoff:UInt64}
	${FACT_GROUPING}
`;

export const ASSERT_FULL_REBUILD_SOURCE_NOT_EMPTY_QUERY = `
	SELECT throwIf(
		(SELECT count()
		 FROM simplified_apex.validations FINAL
		 WHERE
			validation_status IN ('0', '4', '5', '6')
			AND updated_at <= {source_cutoff:UInt64}) = 0,
		'Passenger-demand full rebuild refused: the accepted source set is empty.'
	)
`;

export const ASSERT_FULL_REBUILD_TOTALS_QUERY = `
	SELECT throwIf(
		(SELECT count()
		 FROM simplified_apex.validations FINAL
		 WHERE
			validation_status IN ('0', '4', '5', '6')
			AND updated_at <= {source_cutoff:UInt64})
		!=
		(SELECT coalesce(sum(accepted_validations_qty), 0)
		 FROM performance.passenger_demand_by_dimensions_by_day_full_rebuild
		 WHERE definition_version = '${PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION}'),
		'Passenger-demand full rebuild refused: source and staged totals differ.'
	)
`;

export const EXCHANGE_FULL_REBUILD_TABLE_QUERY = `
	EXCHANGE TABLES
		performance.passenger_demand_by_dimensions_by_day
		AND performance.passenger_demand_by_dimensions_by_day_full_rebuild
`;

export const GET_FULL_REBUILD_STATS_QUERY = `
	SELECT
		count() AS result_rows_qty,
		coalesce(sum(accepted_validations_qty), 0) AS source_rows_qty,
		max(source_watermark) AS source_watermark
	FROM performance.passenger_demand_by_dimensions_by_day_full_rebuild
	WHERE definition_version = '${PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION}'
`;

export const CREATE_RECENT_REFRESH_TABLE_QUERY = `
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
	)
`;

export const TRUNCATE_RECENT_REFRESH_TABLE_QUERY = `
	TRUNCATE TABLE performance.passenger_demand_by_dimensions_by_day_recent_refresh
`;

export const COPY_UNCHANGED_PARTITION_ROWS_QUERY = `
	INSERT INTO performance.passenger_demand_by_dimensions_by_day_recent_refresh
	SELECT *
	FROM performance.passenger_demand_by_dimensions_by_day
	WHERE
		intDiv(operational_date, 100) = {partition_month:UInt32}
		AND NOT (
			definition_version = '${PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION}'
			AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
		)
`;

export const POPULATE_RECENT_REFRESH_TABLE_QUERY = `
	INSERT INTO performance.passenger_demand_by_dimensions_by_day_recent_refresh
	(${FACT_COLUMNS})
	${AGGREGATED_FACT_SELECT}
	WHERE
		validation_status IN ('0', '4', '5', '6')
		AND updated_at <= {source_cutoff:UInt64}
		AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
		AND intDiv(operational_date, 100) = {partition_month:UInt32}
	${FACT_GROUPING}
`;

export const ASSERT_RECENT_REFRESH_TOTALS_QUERY = `
	SELECT throwIf(
		(SELECT count()
		 FROM simplified_apex.validations FINAL
		 WHERE
			validation_status IN ('0', '4', '5', '6')
			AND updated_at <= {source_cutoff:UInt64}
			AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
			AND intDiv(operational_date, 100) = {partition_month:UInt32})
		!=
		(SELECT coalesce(sum(accepted_validations_qty), 0)
		 FROM performance.passenger_demand_by_dimensions_by_day_recent_refresh
		 WHERE
			definition_version = '${PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION}'
			AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
			AND intDiv(operational_date, 100) = {partition_month:UInt32}),
		'Passenger-demand recent refresh refused: source and staged totals differ.'
	)
`;

export const GET_RECENT_REFRESH_STATS_QUERY = `
	SELECT
		count() AS result_rows_qty,
		coalesce(sum(accepted_validations_qty), 0) AS source_rows_qty,
		max(source_watermark) AS source_watermark
	FROM performance.passenger_demand_by_dimensions_by_day_recent_refresh
	WHERE
		definition_version = '${PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION}'
		AND operational_date BETWEEN {start_date:UInt32} AND {end_date:UInt32}
		AND intDiv(operational_date, 100) = {partition_month:UInt32}
`;

export const REPLACE_RECENT_PARTITION_QUERY = `
	ALTER TABLE performance.passenger_demand_by_dimensions_by_day
	REPLACE PARTITION {partition_month:UInt32}
	FROM performance.passenger_demand_by_dimensions_by_day_recent_refresh
`;

/* * */

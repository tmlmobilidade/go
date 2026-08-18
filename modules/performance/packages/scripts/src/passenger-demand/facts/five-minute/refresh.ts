/* * */

import { createLockedClickHouseExecutor, type MetricRefreshLock, type MetricRefreshStats, runMetricRefresh } from '@/metric-refresh-execution/index.js';
import { type PassengerDemandDataStatus } from '@tmlmobilidade/go-types-performance';
import { type OperationalDateInt, type UnixTimestamp, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

import { PASSENGER_DEMAND_ACCEPTED_VALIDATION_STATUSES_SQL, PASSENGER_DEMAND_DEFINITION_VERSION, PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID } from '../../definition.js';
import { buildCurrentPassengerDemandFiveMinuteRefreshRange, buildPassengerDemandFiveMinuteBackfillRange, buildRecentPassengerDemandFiveMinuteRefreshRange, listOperationalDates, PASSENGER_DEMAND_FIVE_MINUTE_BUCKET_MS, type PassengerDemandFiveMinuteRefreshRange } from './refresh-policy.js';

/* * */

const BACKFILL_LOCK_WAIT_MS = 10 * 60 * 1_000;
const PASSENGER_DEMAND_FIVE_MINUTE_LOCK_KEY = 'performance:passenger-demand-by-dimensions-by-5-minutes:refresh-lock';
const PASSENGER_DEMAND_FIVE_MINUTE_METRIC_NAME = 'passenger_demand_by_dimensions_by_5_minutes';

const FACT_COLUMNS = `
	accepted_validations_qty,
	agency_id,
	calculated_at,
	data_status,
	definition_version,
	interval_start,
	line_id,
	operational_date,
	pattern_id,
	source_watermark,
	stop_id
`;

const CREATE_REFRESH_TABLE_QUERY = `
	CREATE TABLE IF NOT EXISTS performance.passenger_demand_by_dimensions_by_5_minutes_refresh
	AS performance.passenger_demand_by_dimensions_by_5_minutes
	ENGINE = MergeTree()
	PARTITION BY operational_date
	ORDER BY
	(
		definition_version,
		operational_date,
		agency_id,
		line_id,
		pattern_id,
		stop_id,
		interval_start
	)
`;

const TRUNCATE_REFRESH_TABLE_QUERY = `
	TRUNCATE TABLE performance.passenger_demand_by_dimensions_by_5_minutes_refresh
`;

const POPULATE_REFRESH_TABLE_QUERY = `
	INSERT INTO performance.passenger_demand_by_dimensions_by_5_minutes_refresh
	(${FACT_COLUMNS})
	SELECT
		count() AS accepted_validations_qty,
		agency_id,
		toUnixTimestamp64Milli(now64(3)) AS calculated_at,
		{data_status:String} AS data_status,
		'${PASSENGER_DEMAND_DEFINITION_VERSION}' AS definition_version,
		intDiv(created_at, ${PASSENGER_DEMAND_FIVE_MINUTE_BUCKET_MS}) * ${PASSENGER_DEMAND_FIVE_MINUTE_BUCKET_MS} AS interval_start,
		ifNull(line_id, '${PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID}') AS line_id,
		operational_date,
		ifNull(pattern_id, '${PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID}') AS pattern_id,
		max(updated_at) AS source_watermark,
		ifNull(stop_id, '${PASSENGER_DEMAND_UNKNOWN_DIMENSION_ID}') AS stop_id
	FROM simplified_apex.validations FINAL
	WHERE
		validation_status IN (${PASSENGER_DEMAND_ACCEPTED_VALIDATION_STATUSES_SQL})
		AND operational_date = {operational_date:UInt32}
		AND created_at <= {source_cutoff:UInt64}
		AND updated_at <= {source_cutoff:UInt64}
	GROUP BY
		operational_date,
		interval_start,
		agency_id,
		line_id,
		pattern_id,
		stop_id
`;

const ASSERT_TOTALS_QUERY = `
	SELECT throwIf(
		(SELECT count()
		 FROM simplified_apex.validations FINAL
		 WHERE
			validation_status IN (${PASSENGER_DEMAND_ACCEPTED_VALIDATION_STATUSES_SQL})
			AND operational_date = {operational_date:UInt32}
			AND created_at <= {source_cutoff:UInt64}
			AND updated_at <= {source_cutoff:UInt64})
		!=
		(SELECT coalesce(sum(accepted_validations_qty), 0)
		 FROM performance.passenger_demand_by_dimensions_by_5_minutes_refresh
		 WHERE
			definition_version = '${PASSENGER_DEMAND_DEFINITION_VERSION}'
			AND operational_date = {operational_date:UInt32}),
		'Passenger-demand five-minute refresh refused: source and staged totals differ.'
	)
`;

const GET_REFRESH_STATS_QUERY = `
	SELECT
		count() AS result_rows_qty,
		coalesce(sum(accepted_validations_qty), 0) AS source_rows_qty,
		max(source_watermark) AS source_watermark
	FROM performance.passenger_demand_by_dimensions_by_5_minutes_refresh
	WHERE
		definition_version = '${PASSENGER_DEMAND_DEFINITION_VERSION}'
		AND operational_date = {operational_date:UInt32}
`;

const REPLACE_PARTITION_QUERY = `
	ALTER TABLE performance.passenger_demand_by_dimensions_by_5_minutes
	REPLACE PARTITION {operational_date:UInt32}
	FROM performance.passenger_demand_by_dimensions_by_5_minutes_refresh
`;

/* * */

interface DateRefreshOptions {
	data_status: PassengerDemandDataStatus
	operational_date: OperationalDateInt
	source_cutoff: UnixTimestamp
}

interface RefreshStatsRow {
	result_rows_qty: number | string
	source_rows_qty: number | string
	source_watermark: null | number | string
}

export interface PassengerDemandFiveMinuteRefreshResult extends MetricRefreshStats {
	refreshed: boolean
	refreshed_dates: OperationalDateInt[]
}

/* * */

function normalizeStats(row: RefreshStatsRow): MetricRefreshStats {
	return {
		result_rows_qty: Number(row.result_rows_qty),
		source_rows_qty: Number(row.source_rows_qty),
		source_watermark: row.source_watermark === null ? null : validateUnixTimestamp(row.source_watermark),
	};
}

async function refreshDate(lock: MetricRefreshLock, options: DateRefreshOptions) {
	const clickhouse = createLockedClickHouseExecutor(lock);
	const queryParams = {
		data_status: options.data_status,
		operational_date: options.operational_date,
		source_cutoff: options.source_cutoff,
	};

	await clickhouse.command(TRUNCATE_REFRESH_TABLE_QUERY);
	await clickhouse.command(POPULATE_REFRESH_TABLE_QUERY, queryParams);
	await clickhouse.assert(ASSERT_TOTALS_QUERY, queryParams);
	const [statsRow] = await clickhouse.query<RefreshStatsRow>(GET_REFRESH_STATS_QUERY, queryParams);
	if (!statsRow) throw new Error(`Could not read passenger-demand five-minute refresh statistics for ${options.operational_date}.`);
	const stats = normalizeStats(statsRow);
	if (stats.source_rows_qty > 0) await clickhouse.command(REPLACE_PARTITION_QUERY, queryParams);
	return stats;
}

async function refreshRange(lock: MetricRefreshLock, range: PassengerDemandFiveMinuteRefreshRange) {
	const clickhouse = createLockedClickHouseExecutor(lock);
	const dates = listOperationalDates(range.start_date, range.end_date);
	const stats: MetricRefreshStats = {
		result_rows_qty: 0,
		source_rows_qty: 0,
		source_watermark: null,
	};

	await clickhouse.command(CREATE_REFRESH_TABLE_QUERY);

	for (const operationalDate of dates) {
		const dateStats = await refreshDate(lock, {
			data_status: range.data_status,
			operational_date: operationalDate,
			source_cutoff: range.source_cutoff,
		});
		stats.result_rows_qty += dateStats.result_rows_qty;
		stats.source_rows_qty += dateStats.source_rows_qty;
		if (dateStats.source_watermark !== null) {
			stats.source_watermark = validateUnixTimestamp(Math.max(stats.source_watermark ?? 0, dateStats.source_watermark));
		}
	}

	return stats;
}

/* * */

export async function refreshPassengerDemandFiveMinuteRange(
	range: PassengerDemandFiveMinuteRefreshRange,
	options: { wait_timeout_ms?: number } = {},
): Promise<PassengerDemandFiveMinuteRefreshResult> {
	const result = await runMetricRefresh(
		{
			definition_version: PASSENGER_DEMAND_DEFINITION_VERSION,
			get_tracking: () => ({
				range_end: range.end_date,
				range_start: range.start_date,
				refresh_type: range.refresh_type,
			}),
			lock_key: PASSENGER_DEMAND_FIVE_MINUTE_LOCK_KEY,
			lock_lost_message: 'Passenger-demand five-minute refresh lock was lost.',
			metric_name: PASSENGER_DEMAND_FIVE_MINUTE_METRIC_NAME,
			...options,
		},
		lock => refreshRange(lock, range),
	);

	if (!result.acquired) {
		return {
			refreshed: false,
			refreshed_dates: [],
			result_rows_qty: 0,
			source_rows_qty: 0,
			source_watermark: null,
		};
	}

	return {
		refreshed: true,
		refreshed_dates: listOperationalDates(range.start_date, range.end_date),
		...result.value,
	};
}

export function refreshCurrentPassengerDemandFiveMinute() {
	return refreshPassengerDemandFiveMinuteRange(buildCurrentPassengerDemandFiveMinuteRefreshRange());
}

export function reconcileRecentPassengerDemandFiveMinute() {
	return refreshPassengerDemandFiveMinuteRange(buildRecentPassengerDemandFiveMinuteRefreshRange());
}

export function backfillPassengerDemandFiveMinute(
	startDate: OperationalDateInt,
	endDate: OperationalDateInt,
) {
	return refreshPassengerDemandFiveMinuteRange(
		buildPassengerDemandFiveMinuteBackfillRange(startDate, endDate),
		{ wait_timeout_ms: BACKFILL_LOCK_WAIT_MS },
	);
}

/* * */

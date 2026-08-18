/* * */

import { createLockedClickHouseExecutor, type MetricRefreshLock, type MetricRefreshStats, runMetricRefresh } from '@/metric-refresh-execution/index.js';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDateInt, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

import { PASSENGER_DEMAND_DEFINITION_VERSION, PASSENGER_DEMAND_TIMEZONE } from '../../definition.js';
import { buildPassengerDemandDailyRefreshPlan, type PassengerDemandDailyRefreshPlan } from './refresh-policy.js';
import { ASSERT_FULL_REBUILD_SOURCE_NOT_EMPTY_QUERY, ASSERT_FULL_REBUILD_TOTALS_QUERY, ASSERT_RECENT_REFRESH_TOTALS_QUERY, COPY_UNCHANGED_PARTITION_ROWS_QUERY, CREATE_FULL_REBUILD_TABLE_QUERY, CREATE_RECENT_REFRESH_TABLE_QUERY, EXCHANGE_FULL_REBUILD_TABLE_QUERY, GET_FULL_REBUILD_RANGE_QUERY, GET_FULL_REBUILD_STATS_QUERY, GET_PERFORMANCE_DATABASE_ENGINE_QUERY, GET_RECENT_REFRESH_STATS_QUERY, POPULATE_FULL_REBUILD_TABLE_QUERY, POPULATE_RECENT_REFRESH_TABLE_QUERY, REPLACE_RECENT_PARTITION_QUERY, TRUNCATE_FULL_REBUILD_TABLE_QUERY, TRUNCATE_RECENT_REFRESH_TABLE_QUERY } from './refresh-sql.js';

/* * */

const FULL_REBUILD_LOCK_WAIT_MS = 10 * 60 * 1_000; // 10 minutes
const PASSENGER_DEMAND_DAILY_LOCK_KEY = 'performance:passenger-demand-by-dimensions-by-day:refresh-lock';
const PASSENGER_DEMAND_DAILY_METRIC_NAME = 'passenger_demand_by_dimensions_by_day';

export interface PassengerDemandDailyRefreshResult {
	mode: 'full' | 'recent'
	partition_months: number[]
	refreshed: boolean
	result_rows_qty: number
	source_rows_qty: number
	source_watermark: null | number
}

interface FullRebuildRangeRow {
	range_end: number | string
	range_start: number | string
}

interface PerformanceDatabaseEngineRow {
	engine: string
}

interface RefreshStatsRow {
	result_rows_qty: number | string
	source_rows_qty: number | string
	source_watermark: null | number | string
}

/* * */

function normalizeStats(row: RefreshStatsRow): MetricRefreshStats {
	return {
		result_rows_qty: Number(row.result_rows_qty),
		source_rows_qty: Number(row.source_rows_qty),
		source_watermark: row.source_watermark === null ? null : validateUnixTimestamp(row.source_watermark),
	};
}

async function getFullRebuildRange(lock: MetricRefreshLock, sourceCutoff: number) {
	const clickhouse = createLockedClickHouseExecutor(lock);
	const fallbackDate = Dates.now(PASSENGER_DEMAND_TIMEZONE).operational_date_int;
	const [row] = await clickhouse.query<FullRebuildRangeRow>(GET_FULL_REBUILD_RANGE_QUERY, {
		fallback_date: fallbackDate,
		source_cutoff: sourceCutoff,
	});
	if (!row) throw new Error('Could not determine the passenger-demand full rebuild range.');

	return {
		range_end: Number(row.range_end) as OperationalDateInt,
		range_start: Number(row.range_start) as OperationalDateInt,
	};
}

async function assertPerformanceDatabaseIsAtomic(lock: MetricRefreshLock) {
	const clickhouse = createLockedClickHouseExecutor(lock);
	const [row] = await clickhouse.query<PerformanceDatabaseEngineRow>(GET_PERFORMANCE_DATABASE_ENGINE_QUERY);
	if (!row) throw new Error('Could not determine the ClickHouse performance database engine.');
	if (row.engine !== 'Atomic') {
		throw new Error(`Passenger-demand full rebuild requires the performance database to use Atomic; found ${row.engine}.`);
	}
}

async function rebuildPassengerDemandDailyFactWithoutLock(lock: MetricRefreshLock, sourceCutoff: number) {
	const clickhouse = createLockedClickHouseExecutor(lock);
	const queryParams = { source_cutoff: sourceCutoff };
	await assertPerformanceDatabaseIsAtomic(lock);
	await clickhouse.command(CREATE_FULL_REBUILD_TABLE_QUERY);
	await clickhouse.command(TRUNCATE_FULL_REBUILD_TABLE_QUERY);
	await clickhouse.command(POPULATE_FULL_REBUILD_TABLE_QUERY, queryParams);
	await clickhouse.assert(ASSERT_FULL_REBUILD_SOURCE_NOT_EMPTY_QUERY, queryParams);
	await clickhouse.assert(ASSERT_FULL_REBUILD_TOTALS_QUERY, queryParams);
	const [statsRow] = await clickhouse.query<RefreshStatsRow>(GET_FULL_REBUILD_STATS_QUERY);
	if (!statsRow) throw new Error('Could not read passenger-demand full rebuild statistics.');
	await clickhouse.command(EXCHANGE_FULL_REBUILD_TABLE_QUERY);
	return normalizeStats(statsRow);
}

async function refreshRecentPassengerDemandDailyFactWithoutLock(lock: MetricRefreshLock, plan: PassengerDemandDailyRefreshPlan, sourceCutoff: number) {
	const clickhouse = createLockedClickHouseExecutor(lock);
	const stats: MetricRefreshStats = {
		result_rows_qty: 0,
		source_rows_qty: 0,
		source_watermark: null,
	};
	await clickhouse.command(CREATE_RECENT_REFRESH_TABLE_QUERY);

	for (const partitionMonth of plan.partition_months) {
		const queryParams = {
			end_date: plan.end_date,
			partition_month: partitionMonth,
			source_cutoff: sourceCutoff,
			start_date: plan.start_date,
		};
		await clickhouse.command(TRUNCATE_RECENT_REFRESH_TABLE_QUERY);
		await clickhouse.command(COPY_UNCHANGED_PARTITION_ROWS_QUERY, queryParams);
		await clickhouse.command(POPULATE_RECENT_REFRESH_TABLE_QUERY, queryParams);
		await clickhouse.assert(ASSERT_RECENT_REFRESH_TOTALS_QUERY, queryParams);
		const [statsRow] = await clickhouse.query<RefreshStatsRow>(GET_RECENT_REFRESH_STATS_QUERY, queryParams);
		if (!statsRow) throw new Error(`Could not read passenger-demand refresh statistics for partition ${partitionMonth}.`);
		const partitionStats = normalizeStats(statsRow);
		await clickhouse.command(REPLACE_RECENT_PARTITION_QUERY, queryParams);
		stats.result_rows_qty += partitionStats.result_rows_qty;
		stats.source_rows_qty += partitionStats.source_rows_qty;
		if (partitionStats.source_watermark !== null) {
			stats.source_watermark = validateUnixTimestamp(Math.max(stats.source_watermark ?? 0, partitionStats.source_watermark));
		}
	}

	return stats;
}

/* * */

export async function rebuildPassengerDemandDailyFact(): Promise<PassengerDemandDailyRefreshResult> {
	let sourceCutoff = Date.now();
	const result = await runMetricRefresh(
		{
			definition_version: PASSENGER_DEMAND_DEFINITION_VERSION,
			get_tracking: async (lock) => {
				sourceCutoff = Date.now();
				const range = await getFullRebuildRange(lock, sourceCutoff);
				return { ...range, refresh_type: 'reconciliation' };
			},
			lock_key: PASSENGER_DEMAND_DAILY_LOCK_KEY,
			lock_lost_message: 'Passenger-demand daily refresh lock was lost.',
			metric_name: PASSENGER_DEMAND_DAILY_METRIC_NAME,
			wait_timeout_ms: FULL_REBUILD_LOCK_WAIT_MS,
		},
		lock => rebuildPassengerDemandDailyFactWithoutLock(lock, sourceCutoff),
	);

	return {
		mode: 'full',
		partition_months: [],
		refreshed: result.acquired,
		result_rows_qty: result.acquired ? result.value.result_rows_qty : 0,
		source_rows_qty: result.acquired ? result.value.source_rows_qty : 0,
		source_watermark: result.acquired ? result.value.source_watermark : null,
	};
}

export async function refreshRecentPassengerDemandDailyFact(
	plan = buildPassengerDemandDailyRefreshPlan(),
): Promise<PassengerDemandDailyRefreshResult> {
	const sourceCutoff = Date.now();
	const result = await runMetricRefresh(
		{
			definition_version: PASSENGER_DEMAND_DEFINITION_VERSION,
			get_tracking: () => ({
				range_end: plan.end_date,
				range_start: plan.start_date,
				refresh_type: 'reconciliation',
			}),
			lock_key: PASSENGER_DEMAND_DAILY_LOCK_KEY,
			lock_lost_message: 'Passenger-demand daily refresh lock was lost.',
			metric_name: PASSENGER_DEMAND_DAILY_METRIC_NAME,
		},
		lock => refreshRecentPassengerDemandDailyFactWithoutLock(lock, plan, sourceCutoff),
	);

	return {
		mode: 'recent',
		partition_months: plan.partition_months,
		refreshed: result.acquired,
		result_rows_qty: result.acquired ? result.value.result_rows_qty : 0,
		source_rows_qty: result.acquired ? result.value.source_rows_qty : 0,
		source_watermark: result.acquired ? result.value.source_watermark : null,
	};
}

/* * */

/* * */

import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type OperationalDateInt, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

import { PASSENGER_DEMAND_HISTORY_TIMEZONE } from './constants.js';
import { type PassengerDemandHistoryLock, withPassengerDemandHistoryLock } from './distributed-lock.js';
import {
	ASSERT_FULL_REBUILD_SOURCE_NOT_EMPTY_QUERY,
	ASSERT_FULL_REBUILD_TOTALS_QUERY,
	ASSERT_RECENT_REFRESH_TOTALS_QUERY,
	COPY_UNCHANGED_PARTITION_ROWS_QUERY,
	CREATE_FULL_REBUILD_TABLE_QUERY,
	CREATE_RECENT_REFRESH_TABLE_QUERY,
	EXCHANGE_FULL_REBUILD_TABLE_QUERY,
	GET_FULL_REBUILD_RANGE_QUERY,
	GET_FULL_REBUILD_STATS_QUERY,
	GET_PERFORMANCE_DATABASE_ENGINE_QUERY,
	GET_RECENT_REFRESH_STATS_QUERY,
	POPULATE_FULL_REBUILD_TABLE_QUERY,
	POPULATE_RECENT_REFRESH_TABLE_QUERY,
	REPLACE_RECENT_PARTITION_QUERY,
	TRUNCATE_FULL_REBUILD_TABLE_QUERY,
	TRUNCATE_RECENT_REFRESH_TABLE_QUERY,
} from './queries.js';
import { buildPassengerDemandHistoryRefreshPlan, type PassengerDemandHistoryRefreshPlan } from './refresh-plan.js';
import { type PassengerDemandHistoryRefreshStats, trackPassengerDemandHistoryRefresh } from './refresh-tracker.js';

/* * */

const FULL_REBUILD_LOCK_WAIT_MS = 10 * 60 * 1_000; // 10 minutes

type ClickHouseQueryParams = Record<string, number | string>;

export interface PassengerDemandHistoryRefreshResult {
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

async function executeCommand(lock: PassengerDemandHistoryLock, query: string, queryParams?: ClickHouseQueryParams) {
	lock.assertOwned();
	const client = await labDb.getClient();
	await client.command({ query, query_params: queryParams });
	lock.assertOwned();
}

async function executeAssertion(lock: PassengerDemandHistoryLock, query: string, queryParams?: ClickHouseQueryParams) {
	lock.assertOwned();
	const client = await labDb.getClient();
	const result = await client.query({ format: 'JSONEachRow', query, query_params: queryParams });
	await result.json();
	lock.assertOwned();
}

async function executeQuery<T>(lock: PassengerDemandHistoryLock, query: string, queryParams?: ClickHouseQueryParams) {
	lock.assertOwned();
	const client = await labDb.getClient();
	const result = await client.query({ format: 'JSONEachRow', query, query_params: queryParams });
	const rows = await result.json<T>();
	lock.assertOwned();
	return rows;
}

function normalizeStats(row: RefreshStatsRow): PassengerDemandHistoryRefreshStats {
	return {
		result_rows_qty: Number(row.result_rows_qty),
		source_rows_qty: Number(row.source_rows_qty),
		source_watermark: row.source_watermark === null ? null : validateUnixTimestamp(row.source_watermark),
	};
}

async function getFullRebuildRange(lock: PassengerDemandHistoryLock, sourceCutoff: number) {
	const fallbackDate = Dates.now(PASSENGER_DEMAND_HISTORY_TIMEZONE).operational_date_int;
	const [row] = await executeQuery<FullRebuildRangeRow>(lock, GET_FULL_REBUILD_RANGE_QUERY, {
		fallback_date: fallbackDate,
		source_cutoff: sourceCutoff,
	});
	if (!row) throw new Error('Could not determine the passenger-demand full rebuild range.');

	return {
		range_end: Number(row.range_end) as OperationalDateInt,
		range_start: Number(row.range_start) as OperationalDateInt,
	};
}

async function assertPerformanceDatabaseIsAtomic(lock: PassengerDemandHistoryLock) {
	const [row] = await executeQuery<PerformanceDatabaseEngineRow>(lock, GET_PERFORMANCE_DATABASE_ENGINE_QUERY);
	if (!row) throw new Error('Could not determine the ClickHouse performance database engine.');
	if (row.engine !== 'Atomic') {
		throw new Error(`Passenger-demand full rebuild requires the performance database to use Atomic; found ${row.engine}.`);
	}
}

async function rebuildPassengerDemandHistoryWithoutLock(lock: PassengerDemandHistoryLock, sourceCutoff: number) {
	const queryParams = { source_cutoff: sourceCutoff };
	await assertPerformanceDatabaseIsAtomic(lock);
	await executeCommand(lock, CREATE_FULL_REBUILD_TABLE_QUERY);
	await executeCommand(lock, TRUNCATE_FULL_REBUILD_TABLE_QUERY);
	await executeCommand(lock, POPULATE_FULL_REBUILD_TABLE_QUERY, queryParams);
	await executeAssertion(lock, ASSERT_FULL_REBUILD_SOURCE_NOT_EMPTY_QUERY, queryParams);
	await executeAssertion(lock, ASSERT_FULL_REBUILD_TOTALS_QUERY, queryParams);
	const [statsRow] = await executeQuery<RefreshStatsRow>(lock, GET_FULL_REBUILD_STATS_QUERY);
	if (!statsRow) throw new Error('Could not read passenger-demand full rebuild statistics.');
	await executeCommand(lock, EXCHANGE_FULL_REBUILD_TABLE_QUERY);
	return normalizeStats(statsRow);
}

async function refreshRecentPassengerDemandHistoryWithoutLock(lock: PassengerDemandHistoryLock, plan: PassengerDemandHistoryRefreshPlan, sourceCutoff: number) {
	const stats: PassengerDemandHistoryRefreshStats = {
		result_rows_qty: 0,
		source_rows_qty: 0,
		source_watermark: null,
	};
	await executeCommand(lock, CREATE_RECENT_REFRESH_TABLE_QUERY);

	for (const partitionMonth of plan.partition_months) {
		const queryParams = {
			end_date: plan.end_date,
			partition_month: partitionMonth,
			source_cutoff: sourceCutoff,
			start_date: plan.start_date,
		};
		await executeCommand(lock, TRUNCATE_RECENT_REFRESH_TABLE_QUERY);
		await executeCommand(lock, COPY_UNCHANGED_PARTITION_ROWS_QUERY, queryParams);
		await executeCommand(lock, POPULATE_RECENT_REFRESH_TABLE_QUERY, queryParams);
		await executeAssertion(lock, ASSERT_RECENT_REFRESH_TOTALS_QUERY, queryParams);
		const [statsRow] = await executeQuery<RefreshStatsRow>(lock, GET_RECENT_REFRESH_STATS_QUERY, queryParams);
		if (!statsRow) throw new Error(`Could not read passenger-demand refresh statistics for partition ${partitionMonth}.`);
		const partitionStats = normalizeStats(statsRow);
		await executeCommand(lock, REPLACE_RECENT_PARTITION_QUERY, queryParams);
		stats.result_rows_qty += partitionStats.result_rows_qty;
		stats.source_rows_qty += partitionStats.source_rows_qty;
		if (partitionStats.source_watermark !== null) {
			stats.source_watermark = validateUnixTimestamp(Math.max(stats.source_watermark ?? 0, partitionStats.source_watermark));
		}
	}

	return stats;
}

/* * */

export async function rebuildPassengerDemandHistory(): Promise<PassengerDemandHistoryRefreshResult> {
	const result = await withPassengerDemandHistoryLock(
		async (lock) => {
			const sourceCutoff = Date.now();
			const range = await getFullRebuildRange(lock, sourceCutoff);
			return trackPassengerDemandHistoryRefresh(
				{ ...range, refresh_type: 'reconciliation' },
				() => rebuildPassengerDemandHistoryWithoutLock(lock, sourceCutoff),
			);
		},
		{ wait_timeout_ms: FULL_REBUILD_LOCK_WAIT_MS },
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

export async function refreshRecentPassengerDemandHistory(
	plan = buildPassengerDemandHistoryRefreshPlan(),
): Promise<PassengerDemandHistoryRefreshResult> {
	const result = await withPassengerDemandHistoryLock(
		lock => trackPassengerDemandHistoryRefresh(
			{
				range_end: plan.end_date,
				range_start: plan.start_date,
				refresh_type: 'reconciliation',
			},
			() => refreshRecentPassengerDemandHistoryWithoutLock(lock, plan, Date.now()),
		),
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

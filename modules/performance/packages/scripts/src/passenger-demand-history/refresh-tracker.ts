/* * */

import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type MetricRefresh, type MetricRefreshType } from '@tmlmobilidade/go-types-performance';
import { type OperationalDateInt, type UnixTimestamp, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { randomUUID } from 'node:crypto';

import { PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION, PASSENGER_DEMAND_HISTORY_METRIC_NAME } from './constants.js';

/* * */

export interface PassengerDemandHistoryRefreshStats {
	result_rows_qty: number
	source_rows_qty: number
	source_watermark: null | UnixTimestamp
}

interface TrackPassengerDemandHistoryRefreshOptions {
	range_end: OperationalDateInt
	range_start: OperationalDateInt
	refresh_type: MetricRefreshType
}

/* * */

function toErrorMessage(error: unknown) {
	return (error instanceof Error ? error.message : String(error)).slice(0, 2_000);
}

async function insertRefreshState(refresh: MetricRefresh) {
	await labDb.performance.metricRefreshes.insert('JSONEachRow', [refresh]);
}

export async function trackPassengerDemandHistoryRefresh(
	options: TrackPassengerDemandHistoryRefreshOptions,
	run: () => Promise<PassengerDemandHistoryRefreshStats>,
) {
	const startedAt = Dates.now('utc').unix_timestamp;
	const runningRefresh: MetricRefresh = {
		completed_at: null,
		definition_version: PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION,
		error_message: null,
		metric_name: PASSENGER_DEMAND_HISTORY_METRIC_NAME,
		range_end: options.range_end,
		range_start: options.range_start,
		refresh_id: randomUUID(),
		refresh_type: options.refresh_type,
		result_rows_qty: 0,
		source_rows_qty: 0,
		source_watermark: null,
		started_at: startedAt,
		status: 'running',
		updated_at: startedAt,
	};

	await insertRefreshState(runningRefresh);

	try {
		const stats = await run();
		const completedAt = validateUnixTimestamp(Math.max(Dates.now('utc').unix_timestamp, startedAt + 1));
		await insertRefreshState({
			...runningRefresh,
			completed_at: completedAt,
			...stats,
			status: 'succeeded',
			updated_at: completedAt,
		});
		return stats;
	} catch (error) {
		const completedAt = validateUnixTimestamp(Math.max(Dates.now('utc').unix_timestamp, startedAt + 1));
		await insertRefreshState({
			...runningRefresh,
			completed_at: completedAt,
			error_message: toErrorMessage(error),
			status: 'failed',
			updated_at: completedAt,
		});
		throw error;
	}
}

/* * */

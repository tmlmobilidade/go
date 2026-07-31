/* * */

import { PASSENGER_DEMAND_DEFINITION_VERSION, PASSENGER_DEMAND_METRIC_NAME } from '@/handlers/passenger-demand/constants.js';
import { type RefreshRange, type RefreshResult } from '@/handlers/passenger-demand/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type MetricRefresh } from '@tmlmobilidade/go-types-performance';
import { randomUUID } from 'node:crypto';

/* * */

function toErrorMessage(error: unknown) {
	return error instanceof Error ? error.message.slice(0, 2_000) : String(error).slice(0, 2_000);
}

async function insertRefreshState(refresh: MetricRefresh) {
	await labDb.performance.metricRefreshes.insert('JSONEachRow', [refresh]);
}

/* * */

export async function runTrackedRefresh(
	range: RefreshRange,
	run: () => Promise<RefreshResult>,
) {
	const startedAt = Dates.now('utc').unix_timestamp;
	const runningRefresh: MetricRefresh = {
		completed_at: null,
		definition_version: PASSENGER_DEMAND_DEFINITION_VERSION,
		error_message: null,
		metric_name: PASSENGER_DEMAND_METRIC_NAME,
		range_end: range.end,
		range_start: range.start,
		refresh_id: randomUUID(),
		refresh_type: range.type,
		result_rows_qty: 0,
		source_rows_qty: 0,
		source_watermark: null,
		started_at: startedAt,
		status: 'running',
		updated_at: startedAt,
	};

	await insertRefreshState(runningRefresh);

	try {
		const result = await run();
		const completedAt = Dates.now('utc').unix_timestamp;

		await insertRefreshState({
			...runningRefresh,
			completed_at: completedAt,
			result_rows_qty: result.resultRowsQty,
			source_rows_qty: result.sourceRowsQty,
			source_watermark: result.sourceWatermark,
			status: 'succeeded',
			updated_at: completedAt,
		});
	} catch (error) {
		const completedAt = Dates.now('utc').unix_timestamp;

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

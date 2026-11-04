import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

/** A single completion record makes all immutable rows in this range visible together. */
export async function publish(metric: string, runId: string, start: string, end: string, referenceAt: number) {
	await labDb.insert({ clickhouse_settings: { async_insert: 0 },
		format: 'JSONEachRow',
		table: 'temp_performance.refreshes',
		values: [{ metric, range_end: end, range_start: start, reference_at: referenceAt, run_id: runId }],
	});
}

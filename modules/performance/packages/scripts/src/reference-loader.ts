import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { randomUUID } from 'node:crypto';

import { fetchPerformanceCalendar } from './calendar.js';
import { publish } from './publish.js';

export async function loadCalendar() {
	const referenceAt = Date.now();
	const runId = randomUUID();
	const calendar = await fetchPerformanceCalendar();
	const values = calendar.map((entry) => {
		const date = String(entry.date);
		return {
			date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
			day_type: entry.day_type,
			holiday: entry.holiday,
			notes: entry.notes,
			period: entry.period,
			run_id: runId,
		};
	});
	if (new Set(values.map(row => row.date)).size !== values.length) throw new Error('Duplicate calendar dates');
	await labDb.insert({ clickhouse_settings: { async_insert: 0 }, format: 'JSONEachRow', table: 'temp_performance.calendar', values });
	await publish('__calendar', runId, '1970-01-01', '1970-01-01', referenceAt);
}

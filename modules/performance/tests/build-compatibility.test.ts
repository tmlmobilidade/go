import assert from 'node:assert/strict';
import { test } from 'node:test';

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';

import { parsePerformanceFilterDate } from '../apps/frontend/src/utils/filter-date.js';
import { fetchPerformanceCalendar } from '../packages/scripts/src/calendar.js';

test('daily and month/year picker values resolve to the same Lisbon operational day', () => {
	for (const date of ['2024-03-31', '2024-07-01', '2024-10-27']) {
		const operationalDate = OperationalDateIntSchema.parse(date);
		const daily = parsePerformanceFilterDate(operationalDate);
		const period = parsePerformanceFilterDate(date);
		assert.equal(daily?.operational_date_int, operationalDate);
		assert.equal(period?.operational_date_int, operationalDate);
		assert.equal(daily?.unix_milliseconds, period?.unix_milliseconds);
		assert.ok(daily?.iso?.includes('T04:00:00'));
	}
});

test('clearing a picker clears its filter without parsing an invalid date', () => {
	assert.equal(parsePerformanceFilterDate(null), null);
});

test('calendar adapter retains metric metadata and rejects unavailable calendars', async (t) => {
	const originalFetch = globalThis.fetch;
	t.after(() => { globalThis.fetch = originalFetch; });
	const calendar = [{ date: '20261017', day_type: '2', holiday: '0', notes: '', period: '1' }];
	globalThis.fetch = async () => new Response(JSON.stringify(calendar));
	assert.deepEqual(await fetchPerformanceCalendar(), calendar);
	globalThis.fetch = async () => new Response('[]');
	await assert.rejects(fetchPerformanceCalendar(), /Calendar data unavailable/);
	globalThis.fetch = async () => new Response('', { status: 503 });
	await assert.rejects(fetchPerformanceCalendar(), /Calendar data unavailable/);
});

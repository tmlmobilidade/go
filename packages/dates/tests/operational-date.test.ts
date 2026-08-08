import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { enrichOperationalDate } from '../src/calendar/operational-date.js';

describe('enrichOperationalDate', () => {
	it('returns normalized metadata from the bundled calendar', () => {
		assert.deepEqual(enrichOperationalDate(20240101), {
			calendar_date: '2024-01-01',
			day_type: '3',
			holiday: '1',
			holiday_name: 'Dia de Ano Novo',
			notes: 'Dia de Ano Novo',
			operational_date: 20240101,
			period: '2',
			weekday: '1',
		});
	});

	it('accepts a formatted calendar date', () => {
		assert.equal(
			enrichOperationalDate('2024-01-01')?.operational_date,
			20240101,
		);
	});

	it('returns undefined when a valid date is outside the snapshot', () => {
		assert.equal(enrichOperationalDate(20300101), undefined);
	});

	it('throws for an invalid date', () => {
		assert.throws(() => enrichOperationalDate('not-a-date'));
	});
});


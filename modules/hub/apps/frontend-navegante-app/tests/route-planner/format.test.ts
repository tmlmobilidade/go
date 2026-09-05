import { formatDateTimeLocalInputValue } from '@/utils/route-planner/presentation/format';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('formatDateTimeLocalInputValue', () => {
	it('formats the local wall-clock date and time expected by datetime-local inputs', () => {
		const date = new Date(2026, 0, 2, 3, 4, 59);

		assert.equal(formatDateTimeLocalInputValue(date), '2026-01-02T03:04');
	});
});

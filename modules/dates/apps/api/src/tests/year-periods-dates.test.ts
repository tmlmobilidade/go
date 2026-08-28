import { UpdateYearPeriodDatesSchema, validateOperationalDate } from '@tmlmobilidade/types';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyYearPeriodDateChanges } from '../utils/year-periods-dates.js';

/* * */

const date = validateOperationalDate;

describe('applyYearPeriodDateChanges', () => {
	it('applies additions and removals in one change set', () => {
		const result = applyYearPeriodDateChanges(
			[date('20260101'), date('20260102'), date('20260103')],
			[date('20260104')],
			[date('20260102')],
		);

		assert.deepEqual(result, [date('20260101'), date('20260103'), date('20260104')]);
	});

	it('deduplicates and sorts added dates', () => {
		const result = applyYearPeriodDateChanges(
			[date('20260103')],
			[date('20260102'), date('20260101'), date('20260102')],
			[],
		);

		assert.deepEqual(result, [date('20260101'), date('20260102'), date('20260103')]);
	});

	it('ignores removals that are not assigned to the period', () => {
		const result = applyYearPeriodDateChanges(
			[date('20260101')],
			[],
			[date('20260102')],
		);

		assert.deepEqual(result, [date('20260101')]);
	});

	it('rejects a date present in both additions and removals', () => {
		const result = UpdateYearPeriodDatesSchema.safeParse({
			add_dates: [date('20260101')],
			remove_dates: [date('20260101')],
		});

		assert.equal(result.success, false);
	});
});

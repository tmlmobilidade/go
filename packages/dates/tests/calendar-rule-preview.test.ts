import { ManualRuleSchema } from '@tmlmobilidade/go-types-offer';
import { toCalendarDate, validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getManualRuleAffectedDates } from '../src/calendar/rules/preview/affectedDates.js';

/* * */

const dates = ['20260328', '20260329', '20260330', '20260331'].map(validateOperationalDate);
const context = {
	endDate: toCalendarDate('2026-03-31'),
	holidays: [],
	periods: [{ _id: 'period', dates }],
	startDate: toCalendarDate('2026-03-28'),
};
const rule = ManualRuleSchema.parse({
	_id: 'rule',
	kind: 'manual',
	operating_mode: 'include',
	timepoints: [],
	weekdays: [1, 2, 3, 4, 5, 6, 7],
	year_period_ids: ['period'],
});

test('previews civil dates across the Lisbon daylight-saving transition', () => {
	assert.deepEqual(getManualRuleAffectedDates(rule, context), {
		count: 4,
		dates: ['2026-03-28', '2026-03-29', '2026-03-30', '2026-03-31'],
	});
});

test('treats holidays as Sundays without requiring document metadata', () => {
	const holidayRule = ManualRuleSchema.parse({ ...rule, weekdays: [7] });
	assert.deepEqual(getManualRuleAffectedDates(holidayRule, { ...context, holidays: [{ dates: [dates[2]] }] }), {
		count: 2,
		dates: ['2026-03-29', '2026-03-30'],
	});
});

test('limits event-based previews to matching civil dates in the visible range', () => {
	const eventRule = ManualRuleSchema.parse({ ...rule, event_id: 'event' });
	assert.deepEqual(getManualRuleAffectedDates(eventRule, { ...context, events: [{ _id: 'event', dates: [dates[2], validateOperationalDate('20260401')] }] }), {
		count: 1,
		dates: ['2026-03-30'],
	});
});

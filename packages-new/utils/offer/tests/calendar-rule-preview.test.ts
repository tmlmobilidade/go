import { ManualRuleSchema, YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { OperationalDateIntSchema, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getManualRuleAffectedDates } from '../src/rules/preview/affectedDates.js';
import { buildAffectedDaysDetails } from '../src/rules/preview/buildDayDetails.js';

/* * */

const dates = ['20260328', '20260329', '20260330', '20260331'].map(date => OperationalDateIntSchema.parse(date));
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
	assert.deepEqual(getManualRuleAffectedDates(eventRule, { ...context, events: [{ _id: 'event', dates: [dates[2], OperationalDateIntSchema.parse('20260401')] }] }), {
		count: 1,
		dates: ['2026-03-30'],
	});
});

test('full schedule previews include both endpoints across spring and autumn clock changes', () => {
	for (const dates of [['20260328', '20260329', '20260330'], ['20261024', '20261025', '20261026']]) {
		const period = YearPeriodSchema.parse({
			_id: 'period',
			agency_ids: ['A'],
			created_at: 1_792_368_000_000,
			created_by: 'user',
			dates,
			name: 'Period',
			updated_at: 1_792_368_000_000,
		});
		const schedule = ManualRuleSchema.parse({ ...rule, timepoints: ['08:00'] });
		const preview = buildAffectedDaysDetails(
			Dates.fromOperationalDateInt(dates[0], 'Europe/Lisbon'),
			Dates.fromOperationalDateInt(dates[2], 'Europe/Lisbon'),
			[schedule],
			[period],
			[],
		);
		assert.deepEqual([...preview.keys()], dates.map(toCalendarDate));
		assert.ok([...preview.values()].every(day => day.finalTimePoints.join(',') === '08:00'));
	}
});

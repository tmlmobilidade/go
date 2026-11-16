import { HolidaySchema } from '@tmlmobilidade/go-types-dates';
import { EventReplacementSchema, EventSchema, hhmm, type ManualRule, ManualRuleSchema, YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { OperationalDateIntSchema, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computeActiveRuleCountFromSplit, computeActiveRules, splitScheduleRules } from '../src/rules/calculation/index.js';
import { manualRuleMatchesReplacement } from '../src/rules/calculation/matchers.js';
import { collectGtfsIncludeContributionsForDate } from '../src/rules/export-attribution/index.js';
import { getManualRuleAffectedDates } from '../src/rules/preview/affectedDates.js';
import { buildAffectedDaysDetails } from '../src/rules/preview/buildDayDetails.js';

const christmas = OperationalDateIntSchema.parse('20261225');
const sunday = OperationalDateIntSchema.parse('20261227');
const metadata = { created_at: 1_792_368_000_000, created_by: 'user', updated_at: 1_792_368_000_000 };
const events = [EventSchema.parse({ ...metadata, _id: 'christmas', agency_ids: ['A'], code: 'NATAL', dates: [christmas], title: 'Natal' })];
const holidays = [HolidaySchema.parse({ ...metadata, _id: 'holiday', agency_ids: ['A'], dates: [christmas], title: 'Natal' })];
const periods = [YearPeriodSchema.parse({ ...metadata, _id: 'FER', agency_ids: ['A'], code: 'FER', dates: [christmas, sunday], name: 'Férias', short_name: 'FER' })];
const base = ManualRuleSchema.parse({
	_id: 'sunday', kind: 'manual', operating_mode: 'include', timepoints: ['06:30', '07:00', '07:30'], weekdays: [7], year_period_ids: ['FER'],
});
const replacement = EventReplacementSchema.parse({
	_id: 'replacement', dates: [christmas], event: { id: 'christmas', title: 'Natal' }, kind: 'event_replacement', lines_mode: 'all', weekdays: [7], year_period_ids: ['FER'],
});
const eventManual = ManualRuleSchema.parse({
	_id: 'exception', event_id: 'christmas', kind: 'manual', operating_mode: 'exclude', timepoints: ['06:30', '07:00'], year_period_ids: [],
});

const filters: { matches: boolean, name: string, values: Partial<ManualRule> }[] = [
	{ matches: true, name: 'omitted weekdays and empty periods', values: {} },
	{ matches: true, name: 'empty weekdays and periods', values: { weekdays: [] } },
	{ matches: true, name: 'Sunday only', values: { weekdays: [7] } },
	{ matches: true, name: 'FER only', values: { year_period_ids: ['FER'] } },
	{ matches: true, name: 'Sunday and FER', values: { weekdays: [7], year_period_ids: ['FER'] } },
	{ matches: false, name: 'Friday only', values: { weekdays: [5] } },
	{ matches: false, name: 'different period', values: { year_period_ids: ['ESC'] } },
	{ matches: false, name: 'Sunday and different period', values: { weekdays: [7], year_period_ids: ['ESC'] } },
	{ matches: false, name: 'Friday and FER', values: { weekdays: [5], year_period_ids: ['FER'] } },
	{ matches: false, name: 'different event', values: { event_id: 'other-event' } },
	{ matches: false, name: 'different month', values: { months: [11] } },
];

for (const { matches, name, values } of filters) {
	test(`Christmas event exclusion with ${name} agrees across editor, calendar, counts and GTFS attribution`, () => {
		const manual = { ...eventManual, ...values };
		const rules = [base, replacement, manual];
		const expected = matches ? [hhmm('07:30')] : base.timepoints;
		const options = { events };
		const impact = getManualRuleAffectedDates(manual, {
			endDate: toCalendarDate('2026-12-31'), events, holidays, periods, startDate: toCalendarDate('2026-01-01'),
		});
		assert.equal(impact.count, matches ? 1 : 0);
		const active = computeActiveRules(christmas, rules, periods, holidays, options);
		assert.deepEqual(active.timepoints, expected);
		assert.equal(active.appliedRuleIds.includes(manual._id), matches);
		assert.equal(computeActiveRuleCountFromSplit(christmas, splitScheduleRules(rules), periods, holidays, options), expected.length);

		const day = Dates.fromOperationalDateInt(christmas, 'Europe/Lisbon');
		const preview = buildAffectedDaysDetails(day, day, rules, periods, holidays, options).get(toCalendarDate(christmas));
		assert.deepEqual(preview?.finalTimePoints, expected);
		assert.equal(preview?.excludeRules.some(detail => detail.rule._id === manual._id), matches);

		const operating = collectGtfsIncludeContributionsForDate(christmas, rules, periods, holidays, options)
			.filter(contribution => contribution.kind === 'operating');
		assert.deepEqual(operating.map(contribution => contribution.timepoint).sort(), expected);
		// Event exceptions must not remove departures on ordinary Sundays.
		assert.deepEqual(computeActiveRules(sunday, rules, periods, holidays, options).timepoints, base.timepoints);
	});
}

test('event includes with empty filters contribute to a replacement timetable and GTFS attribution', () => {
	const manual = { ...eventManual, operating_mode: 'include', timepoints: [hhmm('08:00')] } satisfies ManualRule;
	const rules = [base, replacement, manual];
	const expected = [...base.timepoints, hhmm('08:00')];
	assert.deepEqual(computeActiveRules(christmas, rules, periods, holidays, { events }).timepoints, expected);
	const operating = collectGtfsIncludeContributionsForDate(christmas, rules, periods, holidays, { events })
		.filter(contribution => contribution.kind === 'operating');
	assert.deepEqual(operating.map(contribution => contribution.timepoint).sort(), expected);
	assert.deepEqual(computeActiveRules(sunday, rules, periods, holidays, { events }).timepoints, base.timepoints);
});

test('ordinary manual rules still require explicit weekday and period overlap with replacement targets', () => {
	assert.equal(manualRuleMatchesReplacement(base, replacement), true);
	assert.equal(manualRuleMatchesReplacement({ ...base, weekdays: [] }, replacement), false);
	assert.equal(manualRuleMatchesReplacement({ ...base, weekdays: undefined }, replacement), false);
	assert.equal(manualRuleMatchesReplacement({ ...base, year_period_ids: [] }, replacement), false);
	assert.equal(manualRuleMatchesReplacement({ ...base, weekdays: [5] }, replacement), false);
	assert.equal(manualRuleMatchesReplacement({ ...base, year_period_ids: ['ESC'] }, replacement), false);
});

test('event filters match the replacement targets rather than the civil weekday or period', () => {
	const manual = { ...eventManual, weekdays: [7], year_period_ids: ['FER'] } satisfies ManualRule;
	const civilPeriods = [YearPeriodSchema.parse({ ...periods[0], _id: 'ESC' })];
	const rules = [base, replacement, manual];
	assert.deepEqual(computeActiveRules(christmas, rules, civilPeriods, [], { events }).timepoints, [hhmm('07:30')]);
	assert.deepEqual(
		collectGtfsIncludeContributionsForDate(christmas, rules, civilPeriods, [], { events })
			.filter(contribution => contribution.kind === 'operating').map(contribution => contribution.timepoint),
		[hhmm('07:30')],
	);
});

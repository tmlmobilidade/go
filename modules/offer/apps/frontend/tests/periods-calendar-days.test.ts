import { YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { toCalendarDate } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getPeriodsCalendarDays } from '../src/components/year-periods/shared/periods-calendar-days.js';
import { getPeriodsDateCoverage } from '../src/components/year-periods/shared/periods-date-coverage.js';

/* * */

const agencies = ['A1', 'A2', 'A3', 'A4'];
const school = YearPeriodSchema.parse({ _id: 'school', agency_ids: agencies, color: '#336699', created_at: 1792368000000, created_by: 'actor', dates: [20270101], name: 'School', updated_at: 1792368000000 });
const holiday = YearPeriodSchema.parse({ ...school, _id: 'holiday', color: '#cc6633', dates: [20270102], name: 'Holiday' });

/* * */

test('a period shared by four operators appears once per date', () => {
	const days = getPeriodsCalendarDays([school], agencies);
	assert.deepEqual(days.get(toCalendarDate('2027-01-01'))?.map(period => period._id), ['school']);
	assert.equal(days.size, 1);
});

test('a shared draft takes ownership for all four operators without four separate edits', () => {
	const previewDates = [toCalendarDate('2027-01-01'), toCalendarDate('2027-01-02')];
	const days = getPeriodsCalendarDays([school, holiday], agencies, school._id, previewDates);
	assert.deepEqual(days.get(toCalendarDate('2027-01-02'))?.map(period => period._id), ['school']);
	const coverage = getPeriodsDateCoverage({ agencyIds: agencies, periods: [], previewDates, year: 2027 });
	assert.equal(coverage.missingDates.length, 363);
	assert.equal(coverage.missingDates.includes(toCalendarDate('2027-01-02')), false);
});

test('removing a selected period date reveals a gap, and cancel restores the persisted dates', () => {
	const draft = getPeriodsCalendarDays([school], agencies, school._id, []);
	assert.equal(draft.has(toCalendarDate('2027-01-01')), false);
	const cancelled = getPeriodsCalendarDays([school], agencies, school._id);
	assert.equal(cancelled.has(toCalendarDate('2027-01-01')), true);
});

test('different periods on the same date for different operators retain both owners', () => {
	const other = { ...holiday, agency_ids: ['B'], dates: school.dates };
	const days = getPeriodsCalendarDays([school, other], [...agencies, 'B']);
	assert.deepEqual(days.get(toCalendarDate('2027-01-01'))?.map(period => period._id), ['school', 'holiday']);
	assert.equal(getPeriodsCalendarDays([other], agencies).size, 0);
});

test('preview ownership keeps periods for operators outside the selected shared scope', () => {
	const other = { ...holiday, agency_ids: ['B'], dates: school.dates };
	const days = getPeriodsCalendarDays([school, other], [...agencies, 'B'], school._id, [toCalendarDate('2027-01-01')]);
	assert.deepEqual(days.get(toCalendarDate('2027-01-01'))?.map(period => period._id), ['school', 'holiday']);
});

test('browsing one operator retains the complete shared-period scope in date drafts', () => {
	const date = toCalendarDate('2027-01-02');
	const days = getPeriodsCalendarDays([school, holiday], [agencies[0]], school._id, [date]);
	const owners = days.get(date);
	assert.equal(owners?.length, 1);
	assert.equal(owners?.[0]._id, school._id);
	assert.deepEqual(owners?.[0].agency_ids, agencies);
});

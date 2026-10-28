import { toCalendarDate, validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getPeriodsDateCoverage } from '../src/components/year-periods/shared/periods-date-coverage.js';

/* * */

test('an empty leap year is one range with 366 missing dates', () => {
	const result = getPeriodsDateCoverage({ agencyIds: ['A'], periods: [], previewDates: [], year: 2028 });
	assert.equal(result.missingDates.length, 366);
	assert.deepEqual(result.ranges, [{ end: '2028-12-31', start: '2028-01-01' }]);
});

test('draft dates and other periods cover the year, counting a gap once even for multiple operators', () => {
	const emptyYear = getPeriodsDateCoverage({ agencyIds: ['A'], periods: [], previewDates: [], year: 2027 });
	const previewDates = emptyYear.missingDates.filter(date => date !== '2027-02-01' && date !== '2027-02-03');
	const result = getPeriodsDateCoverage({ agencyIds: ['A', 'B'], periods: [{ agency_ids: ['A'], dates: [validateOperationalDate('20270201')] }], previewDates, year: 2027 });
	assert.deepEqual(result.missingDates, ['2027-02-01', '2027-02-03']);
	assert.deepEqual(result.ranges, [{ end: '2027-02-01', start: '2027-02-01' }, { end: '2027-02-03', start: '2027-02-03' }]);
});

test('unrelated operators and dates outside the visible year do not fill gaps', () => {
	const result = getPeriodsDateCoverage({ agencyIds: ['A'], periods: [{ agency_ids: ['B'], dates: [validateOperationalDate('20270101')] }], previewDates: [toCalendarDate('2026-01-01')], year: 2027 });
	assert.equal(result.missingDates.length, 365);
	assert.equal(result.missingDates[0], '2027-01-01');
});

test('complete preview coverage has no gaps, and removing a draft date reveals a gap', () => {
	const dates = getPeriodsDateCoverage({ agencyIds: ['A'], periods: [], previewDates: [], year: 2027 }).missingDates;
	assert.deepEqual(getPeriodsDateCoverage({ agencyIds: ['A'], periods: [], previewDates: dates, year: 2027 }), { missingDates: [], ranges: [] });
	const result = getPeriodsDateCoverage({ agencyIds: ['A'], periods: [], previewDates: dates.slice(1), year: 2027 });
	assert.deepEqual(result.missingDates, ['2027-01-01']);
});

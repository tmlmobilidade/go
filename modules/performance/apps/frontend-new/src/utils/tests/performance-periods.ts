/* * */

import assert from 'node:assert/strict';

import { getAvailableComparisons, getComparisonPeriod, getPerformancePeriods, normalizeComparison } from '../performance-comparisons';
import { isLineDetailPath } from '../performance-filter-policy';
import { formatOverTimePeriodLabel, getComparisonContextLabel } from '../performance-period-labels';
import { getCurrentPeriod } from '../performance-periods';

/* * */

const referenceDate = new Date('2026-08-18T12:00:00Z');

assert.equal(isLineDetailPath('/network/lines/A2L1N%3A4701'), true);
assert.equal(isLineDetailPath('/performance-new/network/lines/A2L1N%3A4701'), true);
assert.equal(isLineDetailPath('/network/lines/A2L1N%3A4701/demand'), false);

assert.deepEqual(getCurrentPeriod({ preset: 'today' }, referenceDate), {
	endDate: '2026-08-18',
	startDate: '2026-08-18',
});
assert.deepEqual(getCurrentPeriod({ preset: 'yesterday' }, referenceDate), {
	endDate: '2026-08-17',
	startDate: '2026-08-17',
});
assert.deepEqual(getCurrentPeriod({ preset: 'last-7-days' }, referenceDate), {
	endDate: '2026-08-18',
	startDate: '2026-08-12',
});
assert.deepEqual(getCurrentPeriod({ preset: 'month-to-date' }, referenceDate), {
	endDate: '2026-08-18',
	startDate: '2026-08-01',
});
assert.deepEqual(getCurrentPeriod({
	endDate: '2026-08-10',
	preset: 'custom',
	startDate: '2026-08-03',
}, referenceDate), {
	endDate: '2026-08-10',
	startDate: '2026-08-03',
});

assert.deepEqual(getPerformancePeriods({ preset: 'today' }, 'previous-period', referenceDate), {
	comparison: { endDate: '2026-08-17', startDate: '2026-08-17' },
	current: { endDate: '2026-08-18', startDate: '2026-08-18' },
	isSingleDay: true,
});
assert.deepEqual(getPerformancePeriods({ preset: 'yesterday' }, 'previous-week', referenceDate), {
	comparison: { endDate: '2026-08-10', startDate: '2026-08-10' },
	current: { endDate: '2026-08-17', startDate: '2026-08-17' },
	isSingleDay: true,
});
assert.deepEqual(getPerformancePeriods({ preset: 'today' }, 'same-period-last-month', referenceDate), {
	comparison: { endDate: '2026-07-18', startDate: '2026-07-18' },
	current: { endDate: '2026-08-18', startDate: '2026-08-18' },
	isSingleDay: true,
});
assert.deepEqual(getComparisonPeriod({
	endDate: '2026-03-31',
	startDate: '2026-03-01',
}, 'same-period-last-month'), {
	endDate: '2026-02-28',
	startDate: '2026-02-01',
});
assert.deepEqual(getPerformancePeriods({
	endDate: '2026-08-10',
	preset: 'custom',
	startDate: '2026-08-03',
}, 'previous-period', referenceDate), {
	comparison: { endDate: '2026-08-02', startDate: '2026-07-26' },
	current: { endDate: '2026-08-10', startDate: '2026-08-03' },
	isSingleDay: false,
});

assert.match(
	getComparisonContextLabel({ preset: 'yesterday' }, 'previous-period', 'pt-PT', referenceDate),
	/16.*08.*2026/i,
);
assert.match(
	getComparisonContextLabel({ preset: 'yesterday' }, 'previous-week', 'pt-PT', referenceDate),
	/10.*08.*2026/i,
);
assert.equal(
	getComparisonContextLabel({ preset: 'yesterday' }, 'comparable-weekdays', 'pt-PT', referenceDate).split(',').length,
	8,
);

assert.deepEqual(
	getAvailableComparisons({ preset: 'today' }, 'pulse', referenceDate),
	['comparable-weekdays'],
);
assert.deepEqual(
	getAvailableComparisons({ preset: 'today' }, 'analysis', referenceDate),
	['previous-period', 'same-period-last-month', 'previous-week'],
);
assert.deepEqual(
	getAvailableComparisons({ preset: 'yesterday' }, 'analysis', referenceDate, { allowComparableWeekdays: true }),
	['comparable-weekdays', 'previous-period', 'same-period-last-month', 'previous-week'],
);
assert.deepEqual(
	getAvailableComparisons({ preset: 'today' }, 'analysis', referenceDate, { allowComparableWeekdays: true }),
	['previous-period', 'same-period-last-month', 'previous-week'],
);
assert.deepEqual(
	getAvailableComparisons({
		endDate: '2026-08-10',
		preset: 'custom',
		startDate: '2026-08-03',
	}, 'analysis', referenceDate),
	['previous-period', 'same-period-last-month'],
);
assert.equal(
	normalizeComparison({
		endDate: '2026-08-10',
		preset: 'custom',
		startDate: '2026-08-03',
	}, 'previous-week', 'analysis', referenceDate),
	'previous-period',
);

assert.equal(
	formatOverTimePeriodLabel(1_756_108_800_000, 'hour', 'pt-PT'),
	new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' }).format(new Date(1_756_108_800_000)),
);
assert.match(formatOverTimePeriodLabel(20260818, 'day', 'pt-PT'), /18/);

console.log('performance-periods tests passed.');

/* * */

import { OperationalDateIntSchema, type TimezoneIdentified, toCalendarDate } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Dates } from '../src/dates.js';
import { calendarKey, eachCalendarDay } from '../src/helpers/calendar.js';
import { findCommonDates, mergeDateArrays, removeDatesFromArray } from '../src/helpers/date-arrays.js';
import { getOperationalDatesFromRange } from '../src/helpers/dates-from-range.js';
import { buildOperationalDateRange } from '../src/helpers/operational-date-range.js';

/* * */

const timezones: TimezoneIdentified[] = ['Europe/Lisbon', 'Europe/Madrid'];
const clockChangeRanges = [
	['2026-03-28', '2026-03-29', '2026-03-30'],
	['2026-10-24', '2026-10-25', '2026-10-26'],
];

for (const timezone of timezones) {
	test(`${timezone}: civil calendar ranges include both endpoints across both DST transitions`, () => {
		for (const labels of clockChangeRanges) {
			const dates = labels.map(toCalendarDate);
			assert.deepEqual(eachCalendarDay(dates[0], dates[2], timezone), dates);
			assert.deepEqual(eachCalendarDay(dates[2], dates[0], timezone), []);
			assert.deepEqual(eachCalendarDay(dates[1], dates[1], timezone), [dates[1]]);
		}
	});

	test(`${timezone}: operational ranges retain local day labels in winter, summer and across clock changes`, () => {
		for (const labels of [...clockChangeRanges, ['2026-07-01', '2026-07-02', '2026-07-03']]) {
			const expected = labels.map(date => OperationalDateIntSchema.parse(date));
			const start = Dates.fromOperationalDateInt(expected[0], timezone);
			const end = Dates.fromOperationalDateInt(expected[2], timezone);
			assert.deepEqual(buildOperationalDateRange(start.js_date, end.js_date, timezone), expected);
			assert.deepEqual(buildOperationalDateRange(end.js_date, start.js_date, timezone), []);
			assert.deepEqual(getOperationalDatesFromRange(
				OperationalDateIntSchema.parse(expected[0]),
				OperationalDateIntSchema.parse(expected[2]),
				timezone,
			), expected.map(Number));
		}
	});
}

test('UTC instants are preserved when the same instant belongs to different operational days in Lisbon and Madrid', () => {
	const instant = new Date('2026-07-01T02:30:00Z');
	const date = Dates.fromJSDate(instant);
	for (const timezone of timezones) {
		assert.equal(date.setZone(timezone, 'offset_only').unix_milliseconds, instant.getTime());
	}
	assert.deepEqual(buildOperationalDateRange(instant, instant, 'Europe/Lisbon'), [20260630]);
	assert.deepEqual(buildOperationalDateRange(instant, instant, 'Europe/Madrid'), [20260701]);
});

test('one UTC instant can have different civil dates in different timezones', () => {
	const instant = new Date('2026-07-01T22:30:00Z');
	assert.equal(calendarKey(Dates.fromJSDate(instant), 'Europe/Lisbon'), '2026-07-01');
	assert.equal(calendarKey(Dates.fromJSDate(instant), 'Europe/Madrid'), '2026-07-02');
	assert.equal(instant.toISOString(), '2026-07-01T22:30:00.000Z');
});

test('operational cutoff and endpoint inclusion are evaluated in the requested timezone', () => {
	for (const timezone of timezones) {
		const cutoff = Dates.fromOperationalDateInt('20260701', timezone);
		const beforeCutoff = cutoff.minus({ minutes: 1 }).js_date;
		assert.deepEqual(buildOperationalDateRange(beforeCutoff, cutoff.js_date, timezone), [20260630, 20260701]);
		assert.deepEqual(buildOperationalDateRange(cutoff.js_date, cutoff.js_date, timezone), [20260701]);
		const lateStart = cutoff.plus({ hours: 8 }).js_date;
		const nextCutoff = Dates.fromOperationalDateInt('20260702', timezone).js_date;
		assert.deepEqual(buildOperationalDateRange(lateStart, nextCutoff, timezone), [20260701, 20260702]);
	}
});

test('existing operational-range callers default to Lisbon', () => {
	const start = new Date('2026-07-01T03:00:00Z');
	const end = new Date('2026-07-03T03:00:00Z');
	assert.deepEqual(buildOperationalDateRange(start, end), [20260701, 20260702, 20260703]);
});

test('operational dates still begin at 04:00 and accept legacy string contracts at the boundary', () => {
	const beforeCutoff = Dates.fromISO('2026-10-28T03:59:00+00:00');
	const atCutoff = Dates.fromISO('2026-10-28T04:00:00+00:00');
	assert.equal(beforeCutoff.operational_date_int, 20261027);
	assert.equal(atCutoff.operational_date_int, 20261028);
	const date = Dates.fromOperationalDateInt('20260329', 'Europe/Lisbon');
	assert.equal(date.calendar_date, '2026-03-29');
	assert.equal(date.toFormat('HH:mm'), '04:00');
	assert.equal(date.toFormat('ZZ'), '+01:00');
	assert.equal(calendarKey(date), '2026-03-29');
});

test('localized formatting accepts presets and explicit options without changing the instant', () => {
	const date = Dates.fromISO('2026-10-28T12:00:00Z');
	const expected = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long' }).format(date.js_date);
	assert.equal(date.toLocaleString({ day: 'numeric', month: 'long' }, 'pt-PT'), expected);
	assert.equal(date.toLocaleString('short', 'pt-PT'), '28/10/2026');
	assert.equal(date.toLocaleString({ month: 'long' }, 'es-ES'), 'octubre');
	assert.equal(date.toLocaleString({ month: 'long' }, 'pt-PT'), 'outubro');
	assert.equal(date.unix_milliseconds, Date.parse('2026-10-28T12:00:00Z'));
	assert.equal(date.operational_date_int, 20261028);
});

test('date-array operations preserve sorted results, deduplication rules and input arrays', () => {
	const first = [20261029, 20261028].map(date => OperationalDateIntSchema.parse(date));
	const second = [20261028, 20261028, 20261030].map(date => OperationalDateIntSchema.parse(date));
	assert.deepEqual(mergeDateArrays(first, second), [20261028, 20261029, 20261030]);
	assert.deepEqual(removeDatesFromArray(first, second), [20261029]);
	assert.deepEqual(findCommonDates(first, second), [20261028, 20261028]);
	assert.deepEqual(first, [20261029, 20261028]);
	assert.deepEqual(second, [20261028, 20261028, 20261030]);
});

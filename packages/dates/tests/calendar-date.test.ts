import { type CalendarDate } from '@tmlmobilidade/types';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getZonedCalendarDateRangeInterval, getZonedCalendarDayInterval } from '../src/calendar/calendar-date.js';

/* * */

const calendarDate = (value: string) => value as CalendarDate;

/* * */

describe('getZonedCalendarDayInterval', () => {
	it('uses consecutive local midnights across a DST start', () => {
		const interval = getZonedCalendarDayInterval(
			calendarDate('2026-03-29'),
			'Europe/Lisbon',
		);

		assert.equal(interval.start.iso, '2026-03-29T00:00:00.000Z');
		assert.equal(interval.endExclusive.iso, '2026-03-30T00:00:00.000+01:00');
		assert.equal(interval.endExclusive.diff(interval.start, 'hour'), 23);
	});

	it('preserves civil days across different timezone regimes', () => {
		const scenarios = [
			{ date: '2026-11-01', duration: 25, timezone: 'America/New_York' },
			{ date: '2026-08-08', duration: 24, timezone: 'Asia/Tokyo' },
			{ date: '2026-09-27', duration: 23, timezone: 'Pacific/Auckland' },
		] as const;

		for (const scenario of scenarios) {
			const interval = getZonedCalendarDayInterval(
				calendarDate(scenario.date),
				scenario.timezone,
			);

			assert.equal(interval.endExclusive.diff(interval.start, 'hour'), scenario.duration);
		}
	});
});

describe('getZonedCalendarDateRangeInterval', () => {
	it('returns an exclusive local end for an inclusive multi-day range', () => {
		const interval = getZonedCalendarDateRangeInterval(
			calendarDate('2026-12-31'),
			calendarDate('2027-01-02'),
			'Asia/Tokyo',
		);

		assert.equal(interval.start.calendar_date, '2026-12-31');
		assert.equal(interval.endExclusive.calendar_date, '2027-01-03');
		assert.equal(interval.endExclusive.diff(interval.start, 'day'), 3);
	});
});

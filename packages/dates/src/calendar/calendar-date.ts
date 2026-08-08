/* * */

import { Dates } from '@/dates.js';
import { type TimezoneIdentified } from '@/lib/timezone-identified.js';
import { type CalendarDate } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';

/* * */

export interface ZonedCalendarDayInterval {
	date: CalendarDate
	endExclusive: Dates
	start: Dates
	timezone: TimezoneIdentified
}

export interface ZonedCalendarDateRangeInterval {
	endDateInclusive: CalendarDate
	endExclusive: Dates
	start: Dates
	startDate: CalendarDate
	timezone: TimezoneIdentified
}

/* * */

/**
 * Resolves a civil calendar date to its real midnight-to-midnight interval in
 * the supplied timezone. The end is calculated as the next local calendar day,
 * so DST days can be 23 or 25 hours long.
 */
export function getZonedCalendarDayInterval(
	date: CalendarDate,
	timezone: TimezoneIdentified,
): ZonedCalendarDayInterval {
	const start = DateTime.fromISO(date, { zone: timezone }).startOf('day');
	const endExclusive = start.plus({ days: 1 });

	if (!start.isValid || !endExclusive.isValid) {
		throw new Error(`Could not resolve calendar date '${date}' in timezone '${timezone}'.`);
	}

	return {
		date,
		endExclusive: Dates.fromISO(endExclusive.toISO()),
		start: Dates.fromISO(start.toISO()),
		timezone,
	};
}

/**
 * Resolves an inclusive civil-date range to a real interval with an exclusive
 * end at midnight after the final local calendar date.
 */
export function getZonedCalendarDateRangeInterval(
	startDate: CalendarDate,
	endDateInclusive: CalendarDate,
	timezone: TimezoneIdentified,
): ZonedCalendarDateRangeInterval {
	if (startDate > endDateInclusive) {
		throw new Error(`Calendar range starts after it ends: '${startDate}' > '${endDateInclusive}'.`);
	}

	const startDay = getZonedCalendarDayInterval(startDate, timezone);
	const endDay = getZonedCalendarDayInterval(endDateInclusive, timezone);

	return {
		endDateInclusive,
		endExclusive: endDay.endExclusive,
		start: startDay.start,
		startDate,
		timezone,
	};
}

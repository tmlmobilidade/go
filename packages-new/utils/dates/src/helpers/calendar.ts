/* * */

import { CalendarDate, type TimezoneIdentified } from '@tmlmobilidade/go-types-shared';
import { DateTime } from 'luxon';

import { Dates } from '../dates.js';

/* * */

export const DEFAULT_CAL_TZ = 'Europe/Lisbon';

/* * */
/* Calendar day helpers (civil days, not operational days) */
/* * */

/**
 * Canonical calendar day key (civil date) in a timezone.
 * This is the ONE key you should use for calendar UI, selections, holidays, event mapping, etc.
 */
export function calendarKey(d: Dates, tz: TimezoneIdentified = DEFAULT_CAL_TZ): CalendarDate {
	return d.setZone(tz, 'offset_only').toFormat('yyyy-MM-dd') as CalendarDate;
}

/**
 * CalendarDate -> Dates at noon in the requested timezone
 */
export function datesFromCalendarKey(key: CalendarDate, tz: TimezoneIdentified = DEFAULT_CAL_TZ): Dates {
	return Dates.fromFormat(`${key} 12:00`, 'yyyy-MM-dd HH:mm', tz);
}

/**
 * Iterate calendar day keys from start to end inclusive (civil days).
 */
export function eachCalendarDay(start: CalendarDate, end: CalendarDate, tz: TimezoneIdentified = DEFAULT_CAL_TZ): CalendarDate[] {
	const out: CalendarDate[] = [];
	let current = DateTime.fromISO(start, { zone: tz }).startOf('day');
	const last = DateTime.fromISO(end, { zone: tz }).startOf('day');

	if (!current.isValid || !last.isValid) {
		throw new Error(`Invalid calendar range: ${start} - ${end} (${tz})`);
	}

	// Retain the IANA zone while stepping days so offsets follow daylight saving.
	// Comparing UTC instants is safe here because both endpoints use local midnight.
	while (current.toMillis() <= last.toMillis()) {
		out.push(current.toFormat('yyyy-MM-dd') as CalendarDate);
		current = current.plus({ days: 1 });
	}

	return out;
}

/* * */

import { type OperationalDateInt, OperationalDateIntSchema, type TimezoneIdentified, toCalendarDate } from '@tmlmobilidade/go-types-shared';

import { DEFAULT_CAL_TZ, eachCalendarDay } from './calendar.js';

/**
 * Returns an array of individual dates from a given range of operational dates.
 * @param start The start date of the range, in OperationalDateInt format.
 * @param end The end date of the range, in OperationalDateInt format.
 * @param timezone The timezone used for calendar-day iteration.
 * @returns An array of OperationalDateInt objects representing each date in the range.
 */
export function getOperationalDatesFromRange(start: OperationalDateInt, end: OperationalDateInt, timezone: TimezoneIdentified = DEFAULT_CAL_TZ): OperationalDateInt[] {
	if (end < start) {
		throw new Error(`End date "${end}" must be after start date "${start}"`);
	}

	// These are date labels, not instants: walk calendar days without applying a cutoff.
	return eachCalendarDay(toCalendarDate(start), toCalendarDate(end), timezone)
		.map(date => OperationalDateIntSchema.parse(date));
}

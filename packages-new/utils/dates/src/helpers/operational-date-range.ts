/* * */

import { type OperationalDateInt, OperationalDateIntSchema, type TimezoneIdentified, toCalendarDate } from '@tmlmobilidade/go-types-shared';

import { Dates } from '../dates.js';
import { DEFAULT_CAL_TZ, eachCalendarDay } from './calendar.js';

/**
 * Lists every operational date touched by an inclusive range of UTC instants.
 * Each instant is viewed in the requested timezone before applying the 04:00 cutoff.
 * Locale does not affect day membership. Existing callers default to Europe/Lisbon.
 *
 * @param startDate - Start instant (inclusive)
 * @param endDate - End instant (inclusive)
 * @param timezone - Timezone in which the operational dates are defined
 * @returns Ordered operational date labels, or an empty array for a reversed range
 *
 * @example
 * ```ts
 * const start = new Date('2026-07-01T03:00:00Z'); // 04:00 Lisbon
 * const end = new Date('2026-07-03T03:00:00Z');
 * buildOperationalDateRange(start, end);
 * // [20260701, 20260702, 20260703]
 * ```
 */
export function buildOperationalDateRange(startDate: Date, endDate: Date, timezone: TimezoneIdentified = DEFAULT_CAL_TZ): OperationalDateInt[] {
	if (endDate.getTime() < startDate.getTime()) return [];

	// Change the displayed zone while preserving each input's UTC instant.
	const start = Dates.fromJSDate(startDate).setZone(timezone, 'offset_only').operational_date_int;
	const end = Dates.fromJSDate(endDate).setZone(timezone, 'offset_only').operational_date_int;

	return eachCalendarDay(toCalendarDate(start), toCalendarDate(end), timezone)
		.map(date => OperationalDateIntSchema.parse(date));
}

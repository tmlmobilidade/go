/* * */

import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { type OperationalDate, OperationalDateIntSchema, validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { Dates, getOperationalDatesFromRange } from '@tmlmobilidade/go-utils-dates';

import { type GtfsDate } from '../types/gtfs-date.js';

/* * */

/**
 * Build a map of dates to GtfsDate objects.
 * @param dateRange - The date range to build the map for.
 * @param holidays - The holidays to build the map for.
 * @returns A map of dates to GtfsDate objects.
 */
export function buildDatesMap(dateRange: { end: OperationalDate, start: OperationalDate }, holidays: Holiday[]): Map<OperationalDate, GtfsDate> {
	//

	//
	// A. Collect holiday names by operating date

	const holidayByDate = new Map<OperationalDate, string[]>();

	for (const holiday of holidays) {
		for (const date of holiday.dates) {
			const holidayNames = holidayByDate.get(date) ?? [];
			holidayNames.push(holiday.title);
			holidayByDate.set(date, holidayNames);
		}
	}

	//
	// B. Classify dates as weekdays, Saturdays or Sundays and holidays

	const datesMap = new Map<OperationalDate, GtfsDate>();

	for (const dateInt of getOperationalDatesFromRange(OperationalDateIntSchema.parse(dateRange.start), OperationalDateIntSchema.parse(dateRange.end))) {
		const date = validateOperationalDate(String(dateInt));
		const holidayNames = holidayByDate.get(date) ?? [];
		const holiday = holidayNames.length > 0;
		const weekday = Dates.fromOperationalDateInt(dateInt, 'Europe/Lisbon').toFormat('c');

		const dayType: GtfsDate['day_type'] = holiday || weekday === '7'
			? '3'
			: weekday === '6'
				? '2'
				: '1';

		datesMap.set(date, {
			date,
			day_type: dayType,
			holiday: holiday ? '1' : '0',
			notes: holidayNames.join(' / '),
		});
	}

	return datesMap;
}

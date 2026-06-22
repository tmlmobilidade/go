/* * */

import { type GtfsDate } from '@/types.js';
import { Dates, getOperationalDatesFromRange } from '@tmlmobilidade/dates';
import { type Holiday, type OperationalDate } from '@tmlmobilidade/types';

/* * */

export function buildDatesMap(dateRange: { end: OperationalDate, start: OperationalDate }, holidays: Holiday[]): Map<OperationalDate, GtfsDate> {
	const holidayByDate = new Map<OperationalDate, string[]>();

	for (const holiday of holidays) {
		for (const date of holiday.dates) {
			const holidayNames = holidayByDate.get(date) ?? [];
			holidayNames.push(holiday.title);
			holidayByDate.set(date, holidayNames);
		}
	}

	const datesMap = new Map<OperationalDate, GtfsDate>();

	for (const date of getOperationalDatesFromRange(dateRange.start, dateRange.end)) {
		const holidayNames = holidayByDate.get(date) ?? [];
		const holiday = holidayNames.length > 0;
		const weekday = Dates.fromOperationalDate(date, 'Europe/Lisbon').toFormat('c');

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
			period: '1',
		});
	}

	return datesMap;
}

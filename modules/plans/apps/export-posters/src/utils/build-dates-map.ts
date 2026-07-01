/* * */

import { type GtfsDate } from '@/types.js';
import { Dates, getOperationalDatesFromRange } from '@tmlmobilidade/dates';
import { type Holiday, type OperationalDate, type YearPeriod } from '@tmlmobilidade/types';

/* * */

function getHitouchPeriodId(period?: YearPeriod): GtfsDate['period'] {
	if (period?.code === '3' || period?._id === 'UW2U0' || period?.name?.toLowerCase().includes('verão')) return '3';
	if (period?.code === '2' || period?._id === '2KIUJ' || period?.name?.toLowerCase().includes('férias')) return '2';
	return '1';
}

export function buildDatesMap(dateRange: { end: OperationalDate, start: OperationalDate }, holidays: Holiday[], periods: YearPeriod[]): Map<OperationalDate, GtfsDate> {
	const holidayByDate = new Map<OperationalDate, string[]>();
	const periodByDate = new Map<OperationalDate, YearPeriod>();

	for (const holiday of holidays) {
		for (const date of holiday.dates) {
			const holidayNames = holidayByDate.get(date) ?? [];
			holidayNames.push(holiday.title);
			holidayByDate.set(date, holidayNames);
		}
	}

	for (const period of periods) {
		for (const date of period.dates ?? []) {
			periodByDate.set(date, period);
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
			period: getHitouchPeriodId(periodByDate.get(date)),
		});
	}

	return datesMap;
}

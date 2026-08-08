/* * */

import calendarData from '@/calendar/data/operational-dates.json' with { type: 'json' };
import { type EnrichedOperationalDate, EnrichedOperationalDateSchema, type OperationalDateInt, OperationalDateIntSchema, toCalendarDate } from '@tmlmobilidade/go-types-shared';

/* * */

const enrichedOperationalDates = EnrichedOperationalDateSchema.array().parse(
	calendarData.map(entry => ({
		calendar_date: toCalendarDate(entry.date),
		day_type: entry.day_type,
		holiday: entry.holiday,
		holiday_name: entry.holiday_name || null,
		notes: entry.notes || null,
		operational_date: entry.date,
		period: entry.period,
		weekday: entry.weekday,
	})),
);

const enrichedOperationalDateByDate = new Map<OperationalDateInt, EnrichedOperationalDate>(
	enrichedOperationalDates.map(entry => [entry.operational_date, Object.freeze(entry)]),
);

/**
 * Adds calendar metadata to an operational date using the bundled calendar
 * snapshot. Returns undefined when the date is valid but absent from the
 * snapshot, and throws when the input is not a valid operational date.
 */
export function enrichOperationalDate(value: number | string): EnrichedOperationalDate | undefined {
	const normalizedValue = String(value).replaceAll('-', '');
	const operationalDate = OperationalDateIntSchema.parse(normalizedValue);
	return enrichedOperationalDateByDate.get(operationalDate);
}

/* * */

import { type CalendarEntry, Dates as LegacyDates } from '@tmlmobilidade/dates';

/* * */

export type PerformanceCalendarEntry = CalendarEntry;

/** Legacy calendar metadata is still used by the generated Performance metrics. */
export async function fetchPerformanceCalendar(): Promise<PerformanceCalendarEntry[]> {
	const calendar = await LegacyDates.fetchCalendarData();
	if (!calendar?.length) throw new Error('Calendar data unavailable — cannot build Performance metrics');
	return calendar;
}

/* * */

import { Logger } from '@tmlmobilidade/logger';

/* * */

const CALENDAR_PUBLIC_URL = 'https://go.carrismetropolitana.pt/api/dates/public';

/* * */

export interface CalendarEntry {
	date: string
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes: null | string
	period: '1' | '2' | '3'
}

/**
 * Fetches the public calendar (day types, holidays and periods) used to annotate daily metrics.
 * Returns an empty array if the request fails.
 */
export async function fetchCalendarData(): Promise<CalendarEntry[]> {
	try {
		const response = await fetch(CALENDAR_PUBLIC_URL);
		if (!response.ok) return [];
		return await response.json() as CalendarEntry[];
	} catch (error) {
		Logger.error({ error, message: 'Error fetching calendar data' });
		return [];
	}
}

/**
 * Builds a lookup map of calendar entries keyed by `YYYY-MM-DD`.
 * @param calendarEntries The calendar entries (dates in `YYYYMMDD` format)
 */
export function buildCalendarMap(calendarEntries: CalendarEntry[]): Map<string, CalendarEntry> {
	const calendarMap = new Map<string, CalendarEntry>();
	for (const entry of calendarEntries) {
		const dayString = entry.date.toString();
		const formattedDate = `${dayString.slice(0, 4)}-${dayString.slice(4, 6)}-${dayString.slice(6, 8)}`;
		calendarMap.set(formattedDate, entry);
	}
	return calendarMap;
}

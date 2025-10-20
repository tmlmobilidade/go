import { Logs } from '@tmlmobilidade/utils';

/* * */
const CALENDAR_URL = 'https://go.carrismetropolitana.pt/api/dates/public';

interface CalendarEntry {
	date: string
	day_type: string
	holiday: string
	notes: string
	period: string
}

/**
 * Fetches calendar data from the public API
 * Returns an empty array if the request fails
 */
const fetchCalendarData = async (): Promise<CalendarEntry[]> => {
	let calendarJson: CalendarEntry[] = [];

	try {
		const calendarData = await fetch(CALENDAR_URL);
		calendarJson = !calendarData.ok ? [] : await calendarData.json() as CalendarEntry[];
	}
	catch (error) {
		Logs.error(`Error fetching calendar data: ${error instanceof Error ? error.message : String(error)}`);
	}

	return calendarJson;
};

export { type CalendarEntry, fetchCalendarData };

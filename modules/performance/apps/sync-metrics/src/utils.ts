import { Logs } from '@go/utils';

/* * */
const CALENDAR_URL = 'https://go.carrismetropolitana.pt/api/dates/public';

interface CalendarEntry {
	date: string
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes: string
	period: '1' | '2' | '3'
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

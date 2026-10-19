export interface PerformanceCalendarEntry {
	date: number | string
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes: null | string
	period: '1' | '2' | '3'
}

function isCalendarEntry(entry: unknown): entry is PerformanceCalendarEntry {
	if (!entry || typeof entry !== 'object' || !('date' in entry) || !('day_type' in entry) || !('holiday' in entry) || !('period' in entry) || !('notes' in entry)) return false;
	const date = String(entry.date);
	const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
	if (!/^\d{8}$/.test(date) || !Number.isFinite(Date.parse(iso))) return false;
	return [
		new Date(iso).toISOString().slice(0, 10) === iso,
		['1', '2', '3'].includes(String(entry.day_type)) && typeof entry.day_type === 'string',
		['0', '1'].includes(String(entry.holiday)) && typeof entry.holiday === 'string',
		['1', '2', '3'].includes(String(entry.period)) && typeof entry.period === 'string',
		entry.notes === null || typeof entry.notes === 'string',
	].every(Boolean);
}

/** Validate the existing public calendar before replacing the last good copy. */
export async function fetchPerformanceCalendar(): Promise<PerformanceCalendarEntry[]> {
	const response = await fetch('https://go.carrismetropolitana.pt/api/dates/public', { signal: AbortSignal.timeout(30_000) });
	if (!response.ok) throw new Error('Calendar data unavailable — cannot build Performance metrics');
	const calendar: unknown = await response.json();
	if (!Array.isArray(calendar) || calendar.length === 0) throw new Error('Calendar data unavailable — cannot build Performance metrics');
	if (!calendar.every(isCalendarEntry)) throw new Error('Invalid Performance calendar entry');
	return calendar;
}

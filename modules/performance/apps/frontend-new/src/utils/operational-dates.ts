/* * */

const LISBON_TIMEZONE = 'Europe/Lisbon';

/* * */

export function formatOperationalDate(date: Date) {
	return new Intl.DateTimeFormat('sv-SE', {
		day: '2-digit',
		month: '2-digit',
		timeZone: LISBON_TIMEZONE,
		year: 'numeric',
	}).format(date);
}

export function parseOperationalDate(value: string) {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day, 12));
}

export function shiftOperationalDays(date: Date, days: number) {
	const shifted = new Date(date);
	shifted.setUTCDate(shifted.getUTCDate() + days);
	return shifted;
}

export function shiftOperationalMonthsClamped(date: Date, months: number) {
	const shifted = new Date(date);
	const originalDay = shifted.getUTCDate();
	shifted.setUTCMonth(shifted.getUTCMonth() + months);
	if (shifted.getUTCDate() !== originalDay) shifted.setUTCDate(0);
	return shifted;
}

export function getInclusiveOperationalDayCount(startDate: string, endDate: string) {
	const start = parseOperationalDate(startDate);
	const end = parseOperationalDate(endDate);
	return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function operationalDateToUnixTimestamp(date: string) {
	return parseOperationalDate(date).getTime();
}

export function unixTimestampToOperationalDate(timestamp: number) {
	return formatOperationalDate(new Date(timestamp));
}

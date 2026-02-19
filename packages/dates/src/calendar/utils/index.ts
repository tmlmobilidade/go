/* * */

import { Dates } from '@/dates.js';
import { TimezoneIdentified } from '@/types.js';
import { IsoWeekday } from '@tmlmobilidade/types';

/* * */

export const DEFAULT_CAL_TZ = 'Europe/Lisbon';

export type CalendarKey = `${number}-${number}-${number}`; // "YYYY-MM-DD"

/* * */

export interface CalendarDay {
	calendarKey: CalendarKey
	date: Dates
	dayOfMonth: number
	dayOfWeek: number // 1 = Monday, 7 = Sunday (ISO weekday)
	isCurrentMonth: boolean
	isToday: boolean
	isWeekend: boolean
}

export interface MonthGrid {
	days: CalendarDay[]
	month: number // 1-12
	monthName: string
	weeks: CalendarDay[][] // Days organized by week rows
	year: number
}

/* * */
/* Calendar day helpers (civil days, not operational days) */
/* * */

/**
 * Canonical calendar day key (civil date) in a timezone.
 * This is the ONE key you should use for calendar UI, selections, holidays, event mapping, etc.
 */
export function calendarKey(d: Dates, tz: TimezoneIdentified = DEFAULT_CAL_TZ): CalendarKey {
	return d.setZone(tz, 'offset_only').toFormat('yyyy-MM-dd') as CalendarKey;
}

/**
 * CalendarKey -> Dates at noon Lisbon (stable for civil-day iteration)
 */
export function datesFromCalendarKey(key: CalendarKey): Dates {
	return Dates.fromFormat(`${key} 12:00`, 'yyyy-MM-dd HH:mm', DEFAULT_CAL_TZ);
}

/**
 * Extracts the month and year from a given calendar key string.
 *
 * @param key - The calendar key in the format 'YYYY-MM' or similar.
 * @returns An object containing the numeric `month` and `year` extracted from the key.
 */
export function monthYearFromKey(key: CalendarKey): { month: number, year: number } {
	return { month: Number(key.slice(5, 7)), year: Number(key.slice(0, 4)) };
}

/**
 * Parse a string/Date/Dates into a calendar key.
 * - "YYYY-MM-DD" is parsed at 12:00 in tz (avoids DST edge cases + avoids operational cutoff semantics)
 * - ISO strings keep their offset and are then represented in tz
 */
export function parseCalendarKey(input: Date | Dates | string, tz: TimezoneIdentified = DEFAULT_CAL_TZ): CalendarKey {
	if (input instanceof Dates) return calendarKey(input, tz);

	if (input instanceof Date) {
		return calendarKey(Dates.fromJSDate(input).setZone(tz, 'offset_only'), tz);
	}

	if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
		return calendarKey(Dates.fromFormat(`${input} 12:00`, 'yyyy-MM-dd HH:mm', tz), tz);
	}

	return calendarKey(Dates.fromISO(input).setZone(tz, 'offset_only'), tz);
}

/**
 * Convert CalendarKey "YYYY-MM-DD" to "YYYYMMDD" (useful for comparing with period.dates that are stored as yyyyMMdd,
 * but semantically represent civil days).
 */
export function keyToYYYYMMDD(key: CalendarKey): string {
	return key.replace(/-/g, '');
}

/**
 * Convert "YYYYMMDD" to CalendarKey "YYYY-MM-DD".
 */
export function yyyymmddToKey(yyyymmdd: string): CalendarKey {
	return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}` as CalendarKey;
}

/**
 * ISO weekday (1..7 Mon..Sun) for a calendar key or Dates (civil day).
 */
export function calendarWeekday(input: CalendarKey | Dates, tz: TimezoneIdentified = DEFAULT_CAL_TZ): IsoWeekday {
	const key = input instanceof Dates ? calendarKey(input, tz) : input;
	const d = Dates.fromFormat(`${key} 12:00`, 'yyyy-MM-dd HH:mm', tz);
	return Number(d.toFormat('E')) as IsoWeekday;
}

export function isWeekend(input: CalendarKey | Dates, tz: TimezoneIdentified = DEFAULT_CAL_TZ): boolean {
	const wd = calendarWeekday(input, tz);
	return wd === 6 || wd === 7;
}

/**
 * Iterate calendar day keys from start to end inclusive (civil days).
 */
export function eachCalendarDay(start: CalendarKey, end: CalendarKey, tz: TimezoneIdentified = DEFAULT_CAL_TZ): CalendarKey[] {
	const out: CalendarKey[] = [];

	let current = Dates.fromFormat(`${start} 12:00`, 'yyyy-MM-dd HH:mm', tz);
	const last = Dates.fromFormat(`${end} 12:00`, 'yyyy-MM-dd HH:mm', tz);

	while (current.unix_timestamp <= last.unix_timestamp) {
		out.push(calendarKey(current, tz));
		current = current.plus({ days: 1 });
	}

	return out;
}

/**
 * Inclusive range check for civil calendar days.
 */
export function isKeyInRange(key: CalendarKey, start: CalendarKey, end?: CalendarKey): boolean {
	if (!end) return key === start;
	return key >= start && key <= end;
}

/* * */
/* Month grid generation (Monday-first, civil calendar) */
/* * */

/**
 * Generates a calendar grid for a specific month, including overflow days from previous and next months.
 * IMPORTANT: This grid is based on civil days, not operational days.
 */
export function generateMonthGrid(
	year: number,
	month: number,
	fixedWeeks = false,
	tz: TimezoneIdentified = DEFAULT_CAL_TZ,
): MonthGrid {
	// Create the first day of the target month at noon in tz to avoid DST edge cases
	const firstDayOfMonth = Dates.fromFormat(
		`${year}-${String(month).padStart(2, '0')}-01 12:00`,
		'yyyy-MM-dd HH:mm',
		tz,
	);

	const lastDayOfMonth = firstDayOfMonth.endOf('month');

	// Today (civil)
	const todayKey = calendarKey(Dates.now(tz), tz);

	// ISO weekday for first day (1=Mon..7=Sun)
	const firstDayOfWeekNumber = Number(firstDayOfMonth.toFormat('c'));
	const daysFromPrevMonth = firstDayOfWeekNumber - 1; // Monday-first

	// Trailing days
	const lastDayOfWeekNumber = Number(lastDayOfMonth.toFormat('c')); // 1..7
	const naturalDaysFromNextMonth = (7 - lastDayOfWeekNumber) % 7; // Sunday -> 0

	const days: CalendarDay[] = [];

	const pushDay = (date: Dates, isCurrentMonth: boolean) => {
		const key = calendarKey(date, tz);
		const dow = Number(date.toFormat('c')); // 1..7
		days.push({
			calendarKey: key,
			date,
			dayOfMonth: Number(date.toFormat('d')),
			dayOfWeek: dow,
			isCurrentMonth,
			isToday: key === todayKey,
			isWeekend: dow === 6 || dow === 7,
		});
	};

	// Previous month overflow
	if (daysFromPrevMonth > 0) {
		const prevMonthLastDay = firstDayOfMonth.minus({ days: 1 });
		const prevMonthStart = prevMonthLastDay.minus({ days: daysFromPrevMonth - 1 });

		for (let i = 0; i < daysFromPrevMonth; i++) {
			pushDay(prevMonthStart.plus({ days: i }), false);
		}
	}

	// Current month
	const daysInMonth = Number(lastDayOfMonth.toFormat('d'));
	for (let d = 1; d <= daysInMonth; d++) {
		pushDay(firstDayOfMonth.plus({ days: d - 1 }), true);
	}

	// Next month overflow
	const daysFromNextMonth = fixedWeeks ? 42 - days.length : naturalDaysFromNextMonth;
	for (let i = 1; i <= daysFromNextMonth; i++) {
		pushDay(lastDayOfMonth.plus({ days: i }), false);
	}

	// Weeks (rows)
	const weeks: CalendarDay[][] = [];
	for (let i = 0; i < days.length; i += 7) {
		weeks.push(days.slice(i, i + 7));
	}

	const monthName = firstDayOfMonth.toFormat('MMMM');
	return {
		days,
		month,
		monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
		weeks,
		year,
	};
}

/* * */
/* Navigation helpers */
/* * */

export function getNextMonth(year: number, month: number): { month: number, year: number } {
	if (month === 12) return { month: 1, year: year + 1 };
	return { month: month + 1, year };
}

export function getPreviousMonth(year: number, month: number): { month: number, year: number } {
	if (month === 1) return { month: 12, year: year - 1 };
	return { month: month - 1, year };
}

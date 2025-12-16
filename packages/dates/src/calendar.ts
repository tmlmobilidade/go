/* * */

import { Dates } from '@/dates.js';

/* * */

export interface CalendarDay {
	date: Dates
	dayOfMonth: number
	dayOfWeek: number // 0 = Sunday, 6 = Saturday
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

/**
 * Generates a calendar grid for a specific month, including overflow days from previous and next months
 * @param year The year (e.g., 2025)
 * @param month The month (1-12)
 * @param fixedWeeks If true, always generates exactly 6 weeks (42 days) for consistent height
 * @returns A MonthGrid object containing all days to display in a monthly calendar view
 */
export function generateMonthGrid(year: number, month: number, fixedWeeks = false): MonthGrid {
	//
	// Create the first day of the target month
	const firstDayOfMonth = Dates.fromFormat(`${year}-${String(month).padStart(2, '0')}-01`, 'yyyy-MM-dd', 'Europe/Lisbon');

	// Get the last day of the month
	const lastDayOfMonth = firstDayOfMonth.endOf('month');

	// Get current date for comparison
	const today = Dates.now('Europe/Lisbon').startOf('day');

	// Get day of week for first day (0 = Sunday, 6 = Saturday)
	const firstDayOfWeek = firstDayOfMonth.toFormat('c'); // 1 = Monday, 7 = Sunday in Luxon
	const firstDayOfWeekNumber = Number(firstDayOfWeek) % 7; // Convert to 0-6 where 0 = Sunday

	// Calculate how many days from previous month to show
	const daysFromPrevMonth = firstDayOfWeekNumber;

	// Calculate how many days from next month to show
	const lastDayOfWeekNumber = Number(lastDayOfMonth.toFormat('c')) % 7;
	const naturalDaysFromNextMonth = lastDayOfWeekNumber === 0 ? 0 : 7 - lastDayOfWeekNumber;

	const days: CalendarDay[] = [];

	// Add days from previous month
	if (daysFromPrevMonth > 0) {
		const prevMonthLastDay = firstDayOfMonth.minus({ days: 1 });
		const prevMonthStart = prevMonthLastDay.minus({ days: daysFromPrevMonth - 1 });

		for (let i = 0; i < daysFromPrevMonth; i++) {
			const date = prevMonthStart.plus({ days: i });
			days.push({
				date,
				dayOfMonth: Number(date.toFormat('d')),
				dayOfWeek: Number(date.toFormat('c')) % 7,
				isCurrentMonth: false,
				isToday: date.operational_date === today.operational_date,
				isWeekend: [0, 6].includes(Number(date.toFormat('c')) % 7),
			});
		}
	}

	// Add days from current month
	const daysInMonth = Number(lastDayOfMonth.toFormat('d'));
	for (let day = 1; day <= daysInMonth; day++) {
		const date = firstDayOfMonth.plus({ days: day - 1 });
		days.push({
			date,
			dayOfMonth: day,
			dayOfWeek: Number(date.toFormat('c')) % 7,
			isCurrentMonth: true,
			isToday: date.operational_date === today.operational_date,
			isWeekend: [0, 6].includes(Number(date.toFormat('c')) % 7),
		});
	}

	// Calculate how many days from next month to show
	// If fixedWeeks is true, ensure 6 weeks (42 days total) for consistent height in yearly view
	// Otherwise, use natural calculation to avoid unnecessary empty rows in monthly view
	const daysFromNextMonth = fixedWeeks ? 42 - days.length : naturalDaysFromNextMonth;

	// Add days from next month
	for (let i = 1; i <= daysFromNextMonth; i++) {
		const date = lastDayOfMonth.plus({ days: i });
		days.push({
			date,
			dayOfMonth: Number(date.toFormat('d')),
			dayOfWeek: Number(date.toFormat('c')) % 7,
			isCurrentMonth: false,
			isToday: date.operational_date === today.operational_date,
			isWeekend: [0, 6].includes(Number(date.toFormat('c')) % 7),
		});
	}

	// Organize days into weeks (rows of 7)
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

/**
 * Gets the next month's year and month values
 * @param year Current year
 * @param month Current month (1-12)
 * @returns Object with next month's year and month
 */
export function getNextMonth(year: number, month: number): { month: number, year: number } {
	if (month === 12) {
		return { month: 1, year: year + 1 };
	}
	return { month: month + 1, year };
}

/**
 * Gets the previous month's year and month values
 * @param year Current year
 * @param month Current month (1-12)
 * @returns Object with previous month's year and month
 */
export function getPreviousMonth(year: number, month: number): { month: number, year: number } {
	if (month === 1) {
		return { month: 12, year: year - 1 };
	}
	return { month: month - 1, year };
}

/**
 * Checks if a date falls within a date range (inclusive)
 * @param date The date to check
 * @param startDate The range start date
 * @param endDate The range end date (optional, if not provided, checks for single day match)
 * @returns true if the date is within the range
 */
export function isDateInRange(date: Dates, startDate: string, endDate?: string): boolean {
	const checkDate = date.startOf('day');
	const start = Dates.fromISO(startDate).startOf('day');

	if (!endDate) {
		return checkDate.operational_date === start.operational_date;
	}

	const end = Dates.fromISO(endDate).startOf('day');

	return checkDate.unix_timestamp >= start.unix_timestamp && checkDate.unix_timestamp <= end.unix_timestamp;
}

/**
 * Gets all dates in a range as an array of Dates objects
 * @param startDate ISO date string
 * @param endDate ISO date string
 * @returns Array of Dates objects for each day in the range
 */
export function getDatesInRange(startDate: string, endDate: string): Dates[] {
	const start = Dates.fromISO(startDate).startOf('day');
	const end = Dates.fromISO(endDate).startOf('day');

	const dates: Dates[] = [];
	let current = start;

	while (current.unix_timestamp <= end.unix_timestamp) {
		dates.push(current);
		current = current.plus({ days: 1 });
	}

	return dates;
}

/* * */

import { calendarWeekday, Dates } from '@tmlmobilidade/dates';
import { Holiday, OperationalDate, YearPeriod } from '@tmlmobilidade/types';

/* * */

/**
 * Finds which period a date belongs to
 * @param date - The date to check (YYYYMMDD format)
 * @param periods - Map of all periods
 * @returns The period ID ('1', '2', or '3'), or empty string if not found
 */
export function getPeriodForDate(
	date: OperationalDate,
	periods: Map<string, YearPeriod>,
): string {
	// Check each period to see if the date falls within its dates
	for (const period of periods.values()) {
		if (period.dates && period.dates.includes(date)) {
			// Return the period name as a number string
			// Assuming periods have a name like 'Escolar', 'Férias', etc.
			// and we need to map them to '1', '2', '3'
			// For now, we'll use the period's _id or name
			// TODO: Clarify how period names map to period codes
			return period._id;
		}
	}
	return '';
}

/**
 * Checks if a date is a holiday
 * @param date - The date to check (YYYYMMDD format)
 * @param holidays - Map of all holidays
 * @returns 1 if the date is a holiday, 0 otherwise
 */
export function isHoliday(
	date: OperationalDate,
	holidays: Map<string, Holiday>,
): 0 | 1 {
	for (const holiday of holidays.values()) {
		if (holiday.dates.includes(date)) {
			return 1;
		}
	}
	return 0;
}

/**
 * Calculates the day_type for a date
 * Day types in Portuguese transit systems typically are:
 * 1 = Útil (Weekday - Monday to Friday, not holiday)
 * 2 = Sábado (Saturday, not holiday)
 * 3 = Domingo/Feriado (Sunday or Holiday)
 *
 * @param date - The date to check (YYYYMMDD format)
 * @param holidays - Map of all holidays
 * @returns The day type (1, 2, or 3)
 */
export function getDayType(
	date: OperationalDate,
	holidays: Map<string, Holiday>,
): 1 | 2 | 3 {
	// Check if it's a holiday first
	if (isHoliday(date, holidays)) {
		return 3; // Sunday/Holiday
	}

	// Parse the date and get the day of week using calendarWeekday
	const dateObj = Dates.fromOperationalDate(date, 'Europe/Lisbon');
	const dayOfWeek = calendarWeekday(dateObj, 'Europe/Lisbon'); // 1 = Monday, 7 = Sunday

	// Determine day type based on day of week
	if (dayOfWeek >= 1 && dayOfWeek <= 5) {
		return 1; // Weekday
	}
	else if (dayOfWeek === 6) {
		return 2; // Saturday
	}
	else {
		return 3; // Sunday
	}
}

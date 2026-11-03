/* * */

import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { calendarWeekday } from '@tmlmobilidade/go-utils-offer';

/* * */

/**
 * Calculates the day_type for a date
 * Day types in Portuguese transit systems typically are:
 * 1 = Útil (Weekday - Monday to Friday, not holiday)
 * 2 = Sábado (Saturday, not holiday)
 * 3 = Domingo/Feriado (Sunday or Holiday)
 *
 * @param date - The date to check (YYYYMMDD format)
 * @param holidays - Array of all holidays
 * @returns The day type (1, 2, or 3)
 */
export function getDayType(
	date: OperationalDateInt,
	holidays: Holiday[],
): 1 | 2 | 3 {
	// Parse the date and get the day of week using calendarWeekday
	const dateObj = Dates.fromOperationalDateInt(date, 'Europe/Lisbon');
	const dayOfWeek = calendarWeekday(dateObj, holidays, 'Europe/Lisbon'); // 1 = Monday, 7 = Sunday

	// Determine day type based on day of week
	if (dayOfWeek >= 1 && dayOfWeek <= 5) {
		return 1; // Weekday
	} else if (dayOfWeek === 6) {
		return 2; // Saturday
	} else {
		return 3; // Sunday
	}
}

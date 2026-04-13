/* * */

import { calendarWeekday, Dates } from '@tmlmobilidade/dates';
import { Holiday, OperationalDate, YearPeriod } from '@tmlmobilidade/types';

/* * */

/**
 * Finds which period a date belongs to
 * @param date - The date to check (YYYYMMDD format)
 * @param periods - Map of all periods
 * @returns The period code ('1', '2', or '3'), or period ID
 */
export function getPeriodForDate(
	date: OperationalDate,
	periods: Map<string, YearPeriod>,
): string {
	// Check each period to see if the date falls within its dates
	for (const period of periods.values()) {
		if (period.dates?.includes(date)) {
			return period?.code ?? period._id; // Return code if available, otherwise fallback to ID
		}
	}
	return '';
}

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
	date: OperationalDate,
	holidays: Holiday[],
): 1 | 2 | 3 {
	// Parse the date and get the day of week using calendarWeekday
	const dateObj = Dates.fromOperationalDate(date, 'Europe/Lisbon');
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

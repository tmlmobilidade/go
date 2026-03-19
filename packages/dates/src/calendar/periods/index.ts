/* * */

import { CalendarKey, calendarKey, datesFromCalendarKey, keyToYYYYMMDD } from '@/calendar/utils/index.js';
import { OperationalDate } from '@tmlmobilidade/types';

/* * */

/**
 * Converts a date range into an array of CalendarKey strings (YYYY-MM-DD).
 * Returned in sorted order (ascending).
 *
 * @param start - Start day (inclusive) as CalendarKey
 * @param end - End day (inclusive) as CalendarKey
 */
export function convertRangeToKeysArray(start: CalendarKey, end: CalendarKey): CalendarKey[] {
	const keys: CalendarKey[] = [];

	const from = start < end ? start : end;
	const to = start < end ? end : start;

	let current = datesFromCalendarKey(from);
	const endDate = datesFromCalendarKey(to);

	while (current.unix_timestamp <= endDate.unix_timestamp) {
		keys.push(calendarKey(current));
		current = current.plus({ days: 1 });
	}

	return keys;
}

/**
 * Merges two date arrays and returns a sorted, unique array.
 * Duplicates are automatically removed.
 *
 * @param existing - Existing array of operational_date strings
 * @param newDates - New array of operational_date strings to merge
 * @returns Sorted array of unique operational_date strings
 *
 */
export function mergeDateArrays(existing: OperationalDate[], newDates: OperationalDate[]): OperationalDate[] {
	const uniqueDates = new Set([...existing, ...newDates]);
	return Array.from(uniqueDates).sort() as OperationalDate[];
}

/**
 * Removes specified dates from an array.
 * Returns a sorted array with the dates removed.
 *
 * @param array - Original array of operational_date strings
 * @param datesToRemove - Array of operational_date strings to remove
 * @returns Sorted array with specified dates removed
 *
 */
export function removeDatesFromArray(array: OperationalDate[], datesToRemove: OperationalDate[]): OperationalDate[] {
	const removeSet = new Set(datesToRemove);
	return array.filter(date => !removeSet.has(date)).sort() as OperationalDate[];
}

/**
 * Finds common dates between two arrays (intersection).
 * Returns a sorted array of dates that exist in both arrays.
 *
 * @param array1 - First array of operational_date strings
 * @param array2 - Second array of operational_date strings
 * @returns Sorted array of dates found in both arrays
 *
 */
export function findCommonDates(array1: OperationalDate[], array2: OperationalDate[]): OperationalDate[] {
	const set1 = new Set(array1);
	return array2.filter(date => set1.has(date)).sort() as OperationalDate[];
}

export function convertKeysToOperationalDates(keys: CalendarKey[]): OperationalDate[] {
	return keys.map(k => keyToYYYYMMDD(k) as OperationalDate);
}

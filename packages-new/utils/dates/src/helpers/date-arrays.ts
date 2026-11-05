/* * */

import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

/**
 * Merges two date arrays and returns a sorted, unique array.
 * Duplicates are automatically removed.
 *
 * @param existing - Existing array of operational date integers
 * @param newDates - New array of operational date integers to merge
 * @returns Sorted array of unique operational date integers
 *
 */
export function mergeDateArrays(existing: OperationalDateInt[], newDates: OperationalDateInt[]): OperationalDateInt[] {
	const uniqueDates = new Set([...existing, ...newDates]);
	return Array.from(uniqueDates).sort((left, right) => left - right);
}

/**
 * Removes specified dates from an array.
 * Returns a sorted array with the dates removed.
 *
 * @param array - Original array of operational date integers
 * @param datesToRemove - Array of operational date integers to remove
 * @returns Sorted array with specified dates removed
 *
 */
export function removeDatesFromArray(array: OperationalDateInt[], datesToRemove: OperationalDateInt[]): OperationalDateInt[] {
	const removeSet = new Set(datesToRemove);
	return array.filter(date => !removeSet.has(date)).sort((left, right) => left - right);
}

/**
 * Finds common dates between two arrays (intersection).
 * Returns a sorted array of dates that exist in both arrays.
 *
 * @param array1 - First array of operational date integers
 * @param array2 - Second array of operational date integers
 * @returns Sorted array of dates found in both arrays
 *
 */
export function findCommonDates(array1: OperationalDateInt[], array2: OperationalDateInt[]): OperationalDateInt[] {
	const set1 = new Set(array1);
	return array2.filter(date => set1.has(date)).sort((left, right) => left - right);
}

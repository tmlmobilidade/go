/* * */

import { Dates } from '@/dates.js';
import { type OperationalDate } from '@tmlmobilidade/types';

/**
 * Returns an array of individual dates from a given range of operational dates.
 * @param start The start date of the range, in OperationalDate format.
 * @param end The end date of the range, in OperationalDate format.
 * @returns An array of OperationalDate objects representing each date in the range.
 */
export function getOperationalDatesFromRange(start: OperationalDate, end: OperationalDate): OperationalDate[] {
	//

	//
	// Validate the start and end dates

	if (end < start) {
		throw new Error(`End date "${end}" must be after start date "${start}"`);
	}

	//
	// Parse the start and end dates to ensure they are in the correct format

	const startDate = Dates.fromOperationalDate(start, 'Europe/Lisbon');
	const endDate = Dates.fromOperationalDate(end, 'Europe/Lisbon');

	//
	// Create an array to hold the individual dates and iterate
	// from the start date to the end date, adding each date to the array

	const dates: OperationalDate[] = [];

	let current = startDate;

	while (current.operational_date <= endDate.operational_date) {
		dates.push(current.operational_date);
		current = current.plus({ days: 1 });
	}

	return dates;
}

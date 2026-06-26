/* * */

import { DateTime } from 'luxon';
import { z } from 'zod';

/* * */

export const GTFS_DATE_FORMAT = 'yyyyMMdd';

/**
 * Represents a GTFS date in the format 'yyyyMMdd'.
 * Dates in this format represent the day in which
 * the given entity (trip, alerts, etc.) is valid.
 * For example, a trip starting at 3 AM on June 20, 2026
 * would have a start date of `20260619`.
 */
export type GtfsDate = string & {
	__brand: 'GtfsDate'
};

/**
 * Represents a GTFS date as a string in the format 'yyyyMMdd'.
 */
export const GtfsDateSchema = z
	.string()
	.transform(validateGtfsDate);

/**
 * This function validates if a string is a valid
 * GTFS date in the format 'yyyyMMdd'.
 * Throws an error if the date is invalid.
 * @param date The date to be validated.
 * @returns The given string as a GTFS date.
 */
export function validateGtfsDate(value: string): GtfsDate {
	const parsedDate = DateTime.fromFormat(value, GTFS_DATE_FORMAT);
	if (!parsedDate.isValid) throw new Error(`Invalid date format '${value}', expected format: ${GTFS_DATE_FORMAT}, explanation: ${parsedDate.invalidExplanation}`);
	return value as GtfsDate;
}

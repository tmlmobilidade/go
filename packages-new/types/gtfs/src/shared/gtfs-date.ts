/* * */

import { DateTime } from 'luxon';
import { z } from 'zod';

/* * */

export const GTFS_DATE_FORMAT = 'yyyyMMdd';

/**
 * Represents a GTFS date in the format `yyyyMMdd`.
 * Dates in this format represent the day in which
 * the given entity (trip, alerts, etc.) is valid.
 * For example, a trip starting at 3 AM on June 20, 2026
 * would have a start date of `20260619`.
 */
export type GtfsDate = string & {
	__brand: 'GtfsDate'
};

/**
 * Represents a GTFS date as a string in the format `yyyyMMdd`.
 */
export const GtfsDateSchema = z
	.string()
	.transform(validateGtfsDate);

/**
 * This function validates if a string is a valid
 * GtfsDate in the format `yyyyMMdd`.
 * @param value The date in the format `yyyyMMdd` to be validated.
 * @returns The given value as a GtfsDate string.
 * @throws An error if the date is not a valid GtfsDate.
 */
export function validateGtfsDate(value: number | string): GtfsDate {
	const parsedDate = DateTime.fromFormat(String(value), GTFS_DATE_FORMAT);
	if (!parsedDate.isValid) throw new Error(`Invalid date format '${value}', expected format: ${GTFS_DATE_FORMAT}, explanation: ${parsedDate.invalidExplanation}`);
	return String(value) as GtfsDate;
}

/**
 * Transform a date in the format `yyyy-MM-dd`
 * to a GtfsDate in the format `yyyyMMdd`.
 * @param value The date in the format `yyyy-MM-dd` to be transformed.
 * @returns The given date as a GtfsDate string.
 * @throws An error if the date cannot be converted to a GtfsDate.
 */
export function toGtfsDate(value: number | string): GtfsDate {
	const formatedValue = String(value).replace(/-/g, '');
	return validateGtfsDate(formatedValue);
}

/* * */

import { z } from 'zod';

/* * */

export const GTFS_TIME_FORMAT = 'HH:mm:ss';

/**
 * Represents a GTFS time in the format 'HH:mm:ss'.
 * Times in this format represent the time of the day
 * in which the given entity (trip, alerts, etc.) is valid.
 * For example, a trip starting at 3:00 AM, with a a GTFS date of `20260619`,
 * would have a start time of `27:00:00`, longer than 24 hours.
 */
export type GtfsTime = string & {
	__brand: 'GtfsTime'
};

/**
 * Represents a GTFS time as a string in the format 'HH:mm:ss'.
 */
export const GtfsTimeSchema = z
	.string()
	.transform(validateGtfsTime);

/**
 * This function validates if a string is a valid
 * GTFS time in the format 'HH:mm:ss'.
 * Throws an error if the time is invalid.
 * @param time The time to be validated.
 * @returns The given string as a GTFS time.
 */
export function validateGtfsTime(value: string): GtfsTime {
	// Check the structure of the time string
	if (!value.match(/^\d{2}:\d{2}:\d{2}$/)) throw new Error(`Invalid time format '${value}', expected format: ${GTFS_TIME_FORMAT}`);
	// Parse the time string into hours, minutes, and seconds
	const [hours, minutes, seconds] = value.split(':').map(Number);
	// Check if hours are valid (hours can exceed 24)
	if (hours < 0) throw new Error(`Invalid hours in time value '${value}', expected format: ${GTFS_TIME_FORMAT}. Hours must be greater than or equal to 0.`);
	// Check if minutes are valid
	if (minutes < 0 || minutes > 59) throw new Error(`Invalid minutes in time value '${value}', expected format: ${GTFS_TIME_FORMAT}. Minutes must be between 0 and 59.`);
	// Check if seconds are valid
	if (seconds < 0 || seconds > 59) throw new Error(`Invalid seconds in time value '${value}', expected format: ${GTFS_TIME_FORMAT}. Seconds must be between 0 and 59.`);
	// Return the time as a GTFS time
	return value as GtfsTime;
}

/* * */

import { type OperationalTime, OperationalTimeSchema } from '@tmlmobilidade/go-types-shared';
import { type OperationalDate, OperationalDateInt, OperationalDateIntSchema, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * @deprecated Use `fromOperationalTimeAndOperationalDateToUnixMilliseconds()` instead.
 */
export function convertGTFSTimeStringAndOperationalDateToUnixMilliseconds(timeString: string, operationalDate: OperationalDate): UnixMilliseconds {
	// Return early if no time string is provided
	if (!timeString || !operationalDate) throw new Error(`✖︎ No time string or operational date provided. timeString: ${timeString}, operationalDate: ${operationalDate}`);
	// Check if the timestring is in the format HH:MM:SS
	if (!/^\d{2}:\d{2}:\d{2}$/.test(timeString)) throw new Error(`✖︎ Invalid time string format. timeString: ${timeString}`);
	// Extract the individual components of the time string (HH:MM:SS)
	const [hoursOperation, minutesOperation, secondsOperation] = timeString.split(':').map(Number);
	return Dates
		.fromOperationalDateInt(operationalDate, 'Europe/Lisbon')
		.set({ hour: hoursOperation, minute: minutesOperation, second: secondsOperation })
		.unix_milliseconds;
};

/**
 * Convert the combination of a GTFS time and a GTFS date to a Unix timestamp.
 * @param gtfsTime The GTFS time to be converted.
 * @param gtfsDate The GTFS date to be converted.
 * @returns The given time and date as a Unix timestamp.
 */
export function fromOperationalTimeAndOperationalDateToUnixMilliseconds(gtfsTime: OperationalTime, gtfsDate: OperationalDateInt): UnixMilliseconds {
	// Return early if no time string is provided
	if (!gtfsTime || !gtfsDate) throw new Error(`✖︎ No GTFS Time string or GTFS date string provided. gtfsTime: ${gtfsTime}, gtfsDate: ${gtfsDate}`);
	// Check if both params are valid
	const validatedGtfsTime = OperationalTimeSchema.parse(gtfsTime);
	const validatedGtfsDate = OperationalDateIntSchema.parse(gtfsDate);
	// Extract the individual components of the time string (HH:MM:SS)
	const [hours, minutes, seconds] = validatedGtfsTime.split(':').map(Number);
	// Convert the combination of the time and date to a Unix timestamp
	return Dates
		.fromOperationalDateInt(validatedGtfsDate, 'Europe/Lisbon')
		.set({ hour: hours, minute: minutes, second: seconds })
		.unix_milliseconds;
};

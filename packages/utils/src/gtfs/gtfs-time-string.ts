/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type GtfsDate, type GtfsTime, validateGtfsDate, validateGtfsTime } from '@tmlmobilidade/go-types-gtfs';
import { type OperationalDate, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/**
 * @deprecated Use `fromGtfsTimeAndGtfsDateToUnixTimestamp()` instead.
 */
export function convertGTFSTimeStringAndOperationalDateToUnixTimestamp(timeString: string, operationalDate: OperationalDate): UnixTimestamp {
	// Return early if no time string is provided
	if (!timeString || !operationalDate) throw new Error(`✖︎ No time string or operational date provided. timeString: ${timeString}, operationalDate: ${operationalDate}`);
	// Check if the timestring is in the format HH:MM:SS
	if (!/^\d{2}:\d{2}:\d{2}$/.test(timeString)) throw new Error(`✖︎ Invalid time string format. timeString: ${timeString}`);
	// Extract the individual components of the time string (HH:MM:SS)
	const [hoursOperation, minutesOperation, secondsOperation] = timeString.split(':').map(Number);
	return Dates
		.fromOperationalDate(operationalDate, 'Europe/Lisbon')
		.set({ hour: hoursOperation, minute: minutesOperation, second: secondsOperation })
		.unix_timestamp;
};

/**
 * Convert the combination of a GTFS time and a GTFS date to a Unix timestamp.
 * @param gtfsTime The GTFS time to be converted.
 * @param gtfsDate The GTFS date to be converted.
 * @returns The given time and date as a Unix timestamp.
 */
export function fromGtfsTimeAndGtfsDateToUnixTimestamp(gtfsTime: GtfsTime, gtfsDate: GtfsDate): UnixTimestamp {
	// Return early if no time string is provided
	if (!gtfsTime || !gtfsDate) throw new Error(`✖︎ No GTFS Time string or GTFS date string provided. gtfsTime: ${gtfsTime}, gtfsDate: ${gtfsDate}`);
	// Check if both params are valid
	const validatedGtfsTime = validateGtfsTime(gtfsTime);
	const validatedGtfsDate = validateGtfsDate(gtfsDate);
	// Extract the individual components of the time string (HH:MM:SS)
	const [hours, minutes, seconds] = validatedGtfsTime.split(':').map(Number);
	// Convert the combination of the time and date to a Unix timestamp
	return Dates
		.fromOperationalDate(validatedGtfsDate, 'Europe/Lisbon')
		.set({ hour: hours, minute: minutes, second: seconds })
		.unix_timestamp;
};

/* * */

import { type UnixTimestamp } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export const CHUNK_LOG_DATE_FORMAT = 'yyyy-LL-dd\' \'HH\'h \'mm\'m \'ss\'s\'';

/* * */

const STANDARD_WINDOW_HOURS = 10;

/**
 * This function returns the start and end of the standard window interval for a given timestamp.
 * The standard window interval is the period in which is possible to receive data for a given ride.
 * Currently, the standard window starts 10 hours before and ends 10 hours after the scheduled ride start.
 * @param timestamp The timestamp of the scheduled ride start.
 * @returns An object containing the start and end of the standard window interval.
 */
export function getStandardWindowInterval(timestamp?: UnixTimestamp): { end: UnixTimestamp, start: UnixTimestamp } {
	// If no timestamp is provided, use the current time
	const dateObject = timestamp ? Dates.fromMillis(timestamp) : Dates.now();
	// Return the start and end of the standard window interval
	return {
		end: dateObject.plus({ hours: STANDARD_WINDOW_HOURS }).unix_timestamp,
		start: dateObject.minus({ hours: STANDARD_WINDOW_HOURS }).unix_timestamp,
	};
}

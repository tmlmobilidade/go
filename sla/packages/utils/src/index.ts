/* * */

import { type UnixTimestamp } from '@tmlmobilidade/core/types';
import { DateTime } from 'luxon';

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
	const dateObject = timestamp ? DateTime.fromMillis(timestamp) : DateTime.now();
	// Return the start and end of the standard window interval
	return {
		end: dateObject.plus({ hours: STANDARD_WINDOW_HOURS }).toMillis() as UnixTimestamp,
		start: dateObject.minus({ hours: STANDARD_WINDOW_HOURS }).toMillis() as UnixTimestamp,
	};
}

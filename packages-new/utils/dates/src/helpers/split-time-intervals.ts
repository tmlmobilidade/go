/* * */

import { TimeInterval, type UnixMilliseconds, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';

/**
 * Splits a time interval into smaller intervals of a given duration.
 * @param from The start timestamp of the interval.
 * @param to The end timestamp of the interval.
 * @param intervalHrs The duration of the intervals in hours.
 * @returns An array of intervals.
 */
export function splitTimeIntervals(from: UnixMilliseconds, to: UnixMilliseconds, intervalHrs: number) {
	//

	//
	// Validate the input timestamps

	if (from > to) throw new Error('The start timestamp must be before the end timestamp');

	//
	// Convert the interval duration in hours to milliseconds,
	// and calculate how much time is left until the next clean interval step.
	// This is so the intervals are allways of the full duration, starting at 00 hours.

	const intervalMs = intervalHrs * 60 * 60 * 1000;

	const remainder = to % intervalMs;

	//
	// Store the intervals in an array and
	// initialize the end timestamp with the most recent timestamp.

	const finalIntervals: TimeInterval[] = [];

	let endTimestamp: UnixMilliseconds = to;

	//
	// Handle the first, potentially shorter interval.
	// If there is a remainder, create an interval with the remainder as the duration.

	if (remainder > 0) {
		const startTimestamp = UnixMillisecondsSchema.parse(Math.max(from, endTimestamp - remainder));
		finalIntervals.push({ end: endTimestamp, start: startTimestamp });
		endTimestamp = startTimestamp;
	}

	//
	// Handle the regular intervals.
	// If the end timestamp is greater than the start timestamp,
	// create an interval with the duration of the interval.

	while (endTimestamp > from) {
		const startTimestamp = UnixMillisecondsSchema.parse(Math.max(from, endTimestamp - intervalMs));
		finalIntervals.push({ end: endTimestamp, start: startTimestamp });
		endTimestamp = startTimestamp;
	}

	//
	// Return the intervals in reverse order.

	return finalIntervals.reverse();
}

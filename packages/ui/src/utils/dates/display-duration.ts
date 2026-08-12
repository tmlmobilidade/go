/* * */

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

interface DisplayDurationOptions {

	/**
	 * Whether to include the sign of the duration (e.g. '+', '-').
	 * @default true
	 */
	signed?: boolean
}

/**
 * Formats a duration into a human-readable string.
 * The duration is calculated as the difference
 * between two UnixTimestamps.
 * @param startTimestamp The start timestamp in milliseconds.
 * @param endTimestamp The end timestamp in milliseconds.
 * @returns The formatted duration 'X min'.
 */
export function displayDuration(startTimestamp?: null | UnixTimestamp, endTimestamp?: null | UnixTimestamp, options?: DisplayDurationOptions): null | string {
	//

	//
	// Skip if no timestamps are provided

	if (!startTimestamp || !endTimestamp) return null;

	//
	// Set the default options

	options = {
		signed: true,
		...options,
	};

	//
	// Calculate the duration in minutes

	const durationValue = (endTimestamp - startTimestamp) / 1_000 / 60;

	//
	// Set the sign of the duration

	const result: string[] = [];

	if (options?.signed && durationValue > 0) result.push('+');
	if (options?.signed && durationValue < 0) result.push('-');

	//
	// Split the duration into hours and minutes

	const hours = Math.abs(durationValue) >= 60 ? Math.floor(Math.abs(durationValue) / 60) : 0;
	const minutes = Math.abs(durationValue) % 60;

	//
	// Only include hours if greater than 0

	if (hours > 0) result.push(`${hours}h`);

	//
	// Only include minutes if greater than 0

	if (minutes > 0) result.push(`${minutes}min`);

	//
	// Return the formatted value

	return result.join('').trim();
};

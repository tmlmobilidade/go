/* * */

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/**
 * Formats a duration into a human-readable string.
 * The duration is calculated as the difference
 * between two UnixTimestamps.
 * @param startTimestamp The start timestamp.
 * @param endTimestamp The end timestamp.
 * @returns The formatted duration 'X min'.
 */
export function displayDuration(startTimestamp?: null | UnixTimestamp, endTimestamp?: null | UnixTimestamp): null | string {
	// Skip if no timestamps are provided
	if (!startTimestamp || !endTimestamp) return null;
	// Calculate the duration in minutes
	const durationValue = endTimestamp - startTimestamp;
	// Set the sign of the duration
	let result: null | string = null;
	if (durationValue > 0) result = '+';
	if (durationValue < 0) result = '-';
	// Split the duration into hours and minutes
	const hours = Math.floor(Math.abs(durationValue) / 60);
	const minutes = Math.abs(durationValue) % 60;
	// Only include hours if greater than 0
	if (hours > 0) result += `${hours}h`;
	// Only include minutes if greater than 0
	if (minutes > 0) result += `${minutes}min`;
	// Return the formatted value
	return result;
};

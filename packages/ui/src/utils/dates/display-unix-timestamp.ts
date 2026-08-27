/* * */

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { DateFormat } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Formats a timestamp into a human-readable string.
 * @param timestamp The UnixTimestamp to format.
 * @param format The format to use. Defaults to 'HH:mm:ss'.
 * @returns The formatted timestamp 'HH:mm:ss'.
 */
export function displayUnixTimestamp(timestamp?: null | UnixTimestamp, format: DateFormat = 'only_time'): null | string {
	// Skip if no timestamp is provided
	if (!timestamp) return null;
	// Format the timestamp into a human-readable
	// string using the local timezone
	return Dates
		.fromUnixTimestamp(timestamp)
		.setZone('local', 'offset_only')
		.toLocaleString(format, 'pt');
};

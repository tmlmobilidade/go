/* * */

import { Dates, type DatesFormat } from '@tmlmobilidade/go-utils-dates';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/**
 * Formats a timestamp into a human-readable string.
 * @param timestamp The UnixTimestamp to format.
 * @param format The format to use. Defaults to 'HH:mm:ss'.
 * @returns The formatted timestamp 'HH:mm:ss'.
 */
export function displayUnixTimestamp(timestamp?: null | UnixTimestamp, format: DatesFormat = Dates.FORMATS.TIME_SIMPLE): null | string {
	// Skip if no timestamp is provided
	if (!timestamp) return null;
	// Format the timestamp into a human-readable
	// string using the local timezone
	return Dates
		.fromUnixTimestamp(timestamp)
		.setZone('local', 'offset_only')
		.toLocaleString(format, 'pt');
};

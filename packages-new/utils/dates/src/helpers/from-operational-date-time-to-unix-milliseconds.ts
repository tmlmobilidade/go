/* * */

import { type OperationalDateInt, OperationalDateIntSchema, type OperationalTime, OperationalTimeSchema, type TimezoneIdentified, TimezoneIdentifiedSchema, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';

import { Dates } from '../dates.js';

/* * */

interface FromOperationalDateTimeToUnixMillisecondsParams {

	/**
	 * The operational date to convert.
	 * @example '20260101' or '2026-01-01'
	 */
	operational_date: OperationalDateInt

	/**
	 * The operational time to convert.
	 * @example '23:00:00' or '26:30:00'
	 */
	operational_time: OperationalTime

	/**
	 * The timezone to use for the conversion.
	 * @example 'Europe/Lisbon' or 'Spain/Madrid'
	 */
	timezone: TimezoneIdentified

}

/**
 * Convert the combination of an operational date and an operational time to a Unix timestamp.
 * @param params The parameters for the conversion.
 * @returns The given time and date as a Unix timestamp.
 */
export function fromOperationalDateTimeToUnixMilliseconds(params: FromOperationalDateTimeToUnixMillisecondsParams): UnixMilliseconds {
	//

	//
	// Verify if all params are provided

	if (!params) throw new Error(`[fromOperationalDateTimeToUnixMilliseconds()] No parameters provided. params: ${params}`);
	if (!params.operational_time) throw new Error(`[fromOperationalDateTimeToUnixMilliseconds()] No operational time provided. params: ${params}`);
	if (!params.operational_date) throw new Error(`[fromOperationalDateTimeToUnixMilliseconds()] No operational date provided. params: ${params}`);
	if (!params.timezone) throw new Error(`[fromOperationalDateTimeToUnixMilliseconds()] No timezone provided. params: ${params}`);

	//
	// Validate each required param

	const validatedOperationalTime = OperationalTimeSchema.parse(params.operational_time);

	const validatedOperationalDate = OperationalDateIntSchema.parse(params.operational_date);

	const validatedTimezone = TimezoneIdentifiedSchema.parse(params.timezone);

	//
	// Extract the individual components of the time string (HH:MM:SS)

	const [hours, minutes, seconds] = validatedOperationalTime.split(':').map(Number);

	//
	// Convert the combination of the time and date to a Unix timestamp

	return Dates
		.fromOperationalDateInt(validatedOperationalDate, validatedTimezone)
		.set({ hour: hours, minute: minutes, second: seconds })
		.unix_milliseconds;
};

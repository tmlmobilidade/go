/* * */

import { DateTime } from 'luxon';
import { z } from 'zod';

/**
 * UnixSeconds, in this context, is a number that represents
 * the number of seconds since the Unix epoch (1970-01-01T00:00:00Z).
 */
export type UnixSeconds = number & {
	__brand: 'UnixSeconds'
};

/**
 * The schema for a Unix timestamp value in seconds.
 * @example
 * ```ts
 * const unixSeconds = UnixSecondsSchema.parse(1715025600);
 * // => 1715025600 as UnixSeconds
 *
 * const unixSeconds = UnixSecondsSchema.parse('1715025600');
 * // => 1715025600 as UnixSeconds
 *
 * const unixSeconds = UnixSecondsSchema.parse('not a number');
 * // => Throws an error: 'Invalid value 'not a number', expected a number or string in seconds, but received a NaN'
 * ```
 */
export const UnixSecondsSchema = z
	.union([z.string(), z.number()])
	.transform(validateUnixSeconds);

/**
 * This function validates if a number is a valid Unix Seconds, in seconds.
 * It is assumed the number will always be greater than 10^10 (1e10) to ensure it is in seconds.
 * Throws an error if the date is invalid.
 * @param value The number to be validated.
 * @returns The given number as a UnixSeconds.
 * @throws An error if the value is invalid.
 * @example
 * ```ts
 * const unixSeconds = validateUnixSeconds(1715025600);
 * // => 1715025600 as UnixSeconds
 *
 * const unixSeconds = validateUnixSeconds('1715025600');
 * // => 1715025600 as UnixSeconds
 *
 * const unixSeconds = validateUnixSeconds('not a number');
 * // => Throws an error: 'Invalid value 'not a number', expected a number in seconds but received a NaN'
 * ```
 */
export function validateUnixSeconds(value: number | string): UnixSeconds {
	const valueAsNumber = Number(value);
	if (Number.isNaN(valueAsNumber)) throw new Error(`Invalid value '${value}', expected a number in seconds but received a NaN`);
	if (valueAsNumber <= 0) throw new Error(`Invalid value '${value}', expected a number in seconds but received a number less than or equal to 0`);
	if (valueAsNumber < 1e9) throw new Error(`Invalid value '${value}', expected a number in seconds but received a number smaller than 1e9`);
	const parsedDate = DateTime.fromSeconds(valueAsNumber);
	if (!parsedDate.isValid) throw new Error(`Invalid UnixSeconds value '${value}', explanation: ${parsedDate.invalidExplanation}`);
	return valueAsNumber as UnixSeconds;
}

/* * */

import { DateTime } from 'luxon';
import { z } from 'zod';

/**
 * UnixMilliseconds, in this context, is a number that represents
 * the number of milliseconds since the Unix epoch (1970-01-01T00:00:00Z).
 */
export type UnixMilliseconds = number & {
	__brand: 'UnixMilliseconds'
};

/**
 * The schema for a Unix timestamp value in milliseconds.
 * @example
 * ```ts
 * const unixMilliseconds = UnixMillisecondsSchema.parse(1715025600000);
 * // => 1715025600000 as UnixMilliseconds
 *
 * const unixMilliseconds = UnixMillisecondsSchema.parse('1715025600000');
 * // => 1715025600000 as UnixMilliseconds
 *
 * const unixMilliseconds = UnixMillisecondsSchema.parse('not a number');
 * // => Throws an error: 'Invalid value 'not a number', expected a number or string in milliseconds, but received a NaN'
 * ```
 */
export const UnixMillisecondsSchema = z
	.union([z.string(), z.number()])
	.transform(validateUnixMilliseconds);

/**
 * This function validates if a number is a valid Unix Timestamp, in milliseconds.
 * It is assumed the number will always be greater than 10^10 (1e10) to ensure it is in milliseconds.
 * Throws an error if the date is invalid.
 * @param value The number to be validated.
 * @returns The given number as a UnixMilliseconds.
 * @throws An error if the value is invalid.
 * @example
 * ```ts
 * const unixMilliseconds = validateUnixMilliseconds(1715025600000);
 * // => 1715025600000 as UnixMilliseconds
 *
 * const unixMilliseconds = validateUnixMilliseconds('1715025600000');
 * // => 1715025600000 as UnixMilliseconds
 *
 * const unixMilliseconds = validateUnixMilliseconds('not a number');
 * // => Throws an error: 'Invalid value 'not a number', expected a number in milliseconds but received a NaN'
 * ```
 */
export function validateUnixMilliseconds(value: number | string): UnixMilliseconds {
	const valueAsNumber = Number(value);
	if (Number.isNaN(valueAsNumber)) throw new Error(`Invalid value '${value}', expected a number in milliseconds but received a NaN`);
	if (valueAsNumber <= 0) throw new Error(`Invalid value '${value}', expected a number in milliseconds but received a number less than or equal to 0`);
	if (valueAsNumber < 1e10) throw new Error(`Invalid value '${value}', expected a number in milliseconds but received a number smaller than 1e10`);
	const parsedDate = DateTime.fromMillis(valueAsNumber);
	if (!parsedDate.isValid) throw new Error(`Invalid UnixMilliseconds value '${value}', explanation: ${parsedDate.invalidExplanation}`);
	return valueAsNumber as UnixMilliseconds;
}

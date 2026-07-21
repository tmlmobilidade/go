/* * */

import { DateTime } from 'luxon';
import { z } from 'zod';

/**
 * UnixTimestamp, in this context, is a number that represents
 * the number of milliseconds since the Unix epoch (1970-01-01T00:00:00Z).
 */
export type UnixTimestamp = number & {
	__brand: 'UnixTimestamp'
};

/**
 * The schema for a Unix timestamp value.
 * @example
 * ```ts
 * const unixTimestamp = UnixTimestampSchema.parse(1715025600000);
 * // => 1715025600000 as UnixTimestamp
 *
 * const unixTimestamp = UnixTimestampSchema.parse('1715025600000');
 * // => 1715025600000 as UnixTimestamp
 *
 * const unixTimestamp = UnixTimestampSchema.parse('not a number');
 * // => Throws an error: 'Invalid value 'not a number', expected a number or string in milliseconds, but received a NaN'
 * ```
 */
export const UnixTimestampSchema = z
	.union([z.string(), z.number()])
	.transform(validateUnixTimestamp);

/**
 * This function validates if a number is a valid Unix Timestamp, in milliseconds.
 * It is assumed the number will always be greater than 10^10 (1e10) to ensure it is in milliseconds.
 * Throws an error if the date is invalid.
 * @param value The number to be validated.
 * @returns The given number as a UnixTimestamp.
 * @throws An error if the value is invalid.
 * @example
 * ```ts
 * const unixTimestamp = validateUnixTimestamp(1715025600000);
 * // => 1715025600000 as UnixTimestamp
 *
 * const unixTimestamp = validateUnixTimestamp('1715025600000');
 * // => 1715025600000 as UnixTimestamp
 *
 * const unixTimestamp = validateUnixTimestamp('not a number');
 * // => Throws an error: 'Invalid value 'not a number', expected a number in milliseconds but received a NaN'
 * ```
 */
export function validateUnixTimestamp(value: number | string): UnixTimestamp {
	const valueAsNumber = Number(value);
	if (Number.isNaN(valueAsNumber)) throw new Error(`Invalid value '${value}', expected a number in milliseconds but received a NaN`);
	if (valueAsNumber < 1e10) throw new Error(`Invalid value '${value}', expected a number in milliseconds but received a number smaller than 1e10`);
	const parsedDate = DateTime.fromMillis(valueAsNumber);
	if (!parsedDate.isValid) throw new Error(`Invalid UnixTimestamp value '${value}', explanation: ${parsedDate.invalidExplanation}`);
	return parsedDate.toMillis() as UnixTimestamp;
}

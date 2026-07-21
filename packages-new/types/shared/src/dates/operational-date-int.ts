/* * */

import { DateTime } from 'luxon';
import { z } from 'zod';

/**
 * The format for an operational date.
 */
export const OPERATIONAL_DATE_FORMAT = 'yyyyMMdd';

/**
 * Represents an operational date as an integer in the format 'yyyyMMdd'.
 * @example 20260620 (June 20, 2026 between 04:00 and 03:59 of the following day)
 */
export type OperationalDateInt = number & {
	__brand: 'OperationalDateInt'
};

/**
 * The schema for an operational date value.
 * @example
 * ```ts
 * const operationalDateInt = OperationalDateIntSchema.parse(20260620);
 * // => 20260620 as OperationalDateInt
 *
 * const operationalDateInt = OperationalDateIntSchema.parse('20260620');
 * // => 20260620 as OperationalDateInt
 * ```
 */
export const OperationalDateIntSchema = z
	.union([z.string(), z.number()])
	.transform(validateOperationalDateInt);

/**
 * This function validates if a value is a valid operational date.
 * Throws an error if the value is invalid.
 * @param value The value to be validated.
 * @returns The given value as an OperationalDateInt.
 * @throws An error if the value is invalid.
 * @example
 * ```ts
 * const operationalDateInt = validateOperationalDateInt(20260620);
 * // => 20260620 as OperationalDateInt
 *
 * const operationalDateInt = validateOperationalDateInt('20260620');
 * // => 20260620 as OperationalDateInt
 *
 * const operationalDateInt = validateOperationalDateInt('2026-06-20');
 * // => 20260620 as OperationalDateInt
 *
 * const operationalDateInt = validateOperationalDateInt('not a number');
 * // => Throws an error: 'Invalid value 'not a number', expected a number or string in format 'yyyyMMdd' or a string in format 'yyyy-MM-dd', but received a NaN'
 * ```
 */
export function validateOperationalDateInt(value: number | string): OperationalDateInt {
	const valueAsString = String(value).replaceAll('-', '');
	const parsedDate = DateTime.fromFormat(String(value), OPERATIONAL_DATE_FORMAT);
	if (!parsedDate.isValid) throw new Error(`Invalid date format '${value}', expected format: ${OPERATIONAL_DATE_FORMAT}, explanation: ${parsedDate.invalidExplanation}`);
	return Number(valueAsString) as OperationalDateInt;
}

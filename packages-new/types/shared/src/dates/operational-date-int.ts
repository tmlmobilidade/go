/* * */

import { DateTime } from 'luxon';
import { z } from 'zod';

/* * */

export const OPERATIONAL_DATE_FORMAT = 'yyyyMMdd';

/**
 * Represents an operational date as an integer in the format 'yyyyMMdd'.
 * @example 20260620 (June 20, 2026 between 04:00 and 03:59 of the following day)
 */
export type OperationalDateInt = number & {
	__brand: 'OperationalDateInt'
};

export const OperationalDateIntSchema = z
	.number()
	.transform(validateOperationalDateInt);

/**
 * This function validates if a value is a valid operational date.
 * Throws an error if the value is invalid.
 * @param value The value to be validated.
 * @returns The given value as an OperationalDateInt.
 */
export function validateOperationalDateInt(value: number | string): OperationalDateInt {
	const parsedDate = DateTime.fromFormat(String(value), OPERATIONAL_DATE_FORMAT);
	if (!parsedDate.isValid) throw new Error(`Invalid date format '${value}', expected format: ${OPERATIONAL_DATE_FORMAT}, explanation: ${parsedDate.invalidExplanation}`);
	return Number(value) as OperationalDateInt;
}

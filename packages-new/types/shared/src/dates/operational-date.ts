/* * */

import { OPERATIONAL_DATE_FORMAT } from '@/dates/operational-date-int.js';
import { DateTime } from 'luxon';
import { z } from 'zod';

/**
 * Represents an operational date in the format 'yyyyMMdd'.
 * @deprecated Use the OperationalDateInt type instead, for better performance.
 */
export type OperationalDate = string & {
	__brand: 'OperationalDate'
};

/**
 * Represents an operational date as a string in the format 'yyyyMMdd'.
 * @deprecated Use the OperationalDateIntSchema and validateOperationalDateInt function instead, for better performance.
 */
export const OperationalDateSchema = z
	.string()
	.transform(validateOperationalDate);

/**
 * This function validates if a string is a valid
 * operational date in the format 'yyyyMMdd'.
 * Throws an error if the date is invalid.
 * @param date The date to be validated.
 * @returns The given string as an OperationalDate.
 * @deprecated Use the OperationalDateIntSchema and validateOperationalDateInt function instead, for better performance.
 */
export function validateOperationalDate(date: string): OperationalDate {
	const parsedDate = DateTime.fromFormat(date, OPERATIONAL_DATE_FORMAT);
	if (!parsedDate.isValid) throw new Error(`Invalid date format '${date}', expected format: ${OPERATIONAL_DATE_FORMAT}, explanation: ${parsedDate.invalidExplanation}`);
	return date as OperationalDate;
}

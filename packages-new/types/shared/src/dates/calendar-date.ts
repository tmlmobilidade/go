/* * */

import { DateTime } from 'luxon';
import { z } from 'zod';

/* * */

export const CALENDAR_DATE_FORMAT = 'yyyy-MM-dd';

export type CalendarDate = string & {
	__brand: 'CalendarDate'
};

export const CalendarDateSchema = z
	.string()
	.transform(validateCalendarDate);

/**
 * This function validates if a string is a valid calendar date.
 * Throws an error if the date is invalid.
 * @param date - The date to be validated.
 * @returns The given string as a CalendarDate.
 */
export function validateCalendarDate(date: string): CalendarDate {
	const parsedDate = DateTime.fromFormat(date, CALENDAR_DATE_FORMAT);
	if (!parsedDate.isValid) throw new Error(`Invalid date format '${date}', expected format: ${CALENDAR_DATE_FORMAT}, explanation: ${parsedDate.invalidExplanation}`);
	return date as CalendarDate;
}

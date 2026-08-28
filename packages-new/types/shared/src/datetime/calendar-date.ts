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
 * This function validates if a string is a valid calendar date
 * in the format `yyyy-MM-dd`.
 * @param value The date in the format `yyyy-MM-dd` to be validated.
 * @returns The given date as a CalendarDate string.
 * @throws An error if the date is not a valid CalendarDate.
 */
export function validateCalendarDate(value: string): CalendarDate {
	const parsedDate = DateTime.fromFormat(value, CALENDAR_DATE_FORMAT);
	if (!parsedDate.isValid) throw new Error(`Invalid date format '${value}', expected format: ${CALENDAR_DATE_FORMAT}, explanation: ${parsedDate.invalidExplanation}`);
	return value as CalendarDate;
}

/**
 * Transform a date in the format `yyyyMMdd`
 * to a calendar date in the format `yyyy-MM-dd`.
 * @param value The date in the format `yyyyMMdd` to be transformed.
 * @returns The given date as a CalendarDate string.
 * @throws An error if the date cannot be converted to a CalendarDate.
 */
export function toCalendarDate(value: number | string): CalendarDate {
	let formatedValue = String(value);
	if (formatedValue.length === 8) formatedValue = `${formatedValue.slice(0, 4)}-${formatedValue.slice(4, 6)}-${formatedValue.slice(6, 8)}`;
	return validateCalendarDate(formatedValue);
}

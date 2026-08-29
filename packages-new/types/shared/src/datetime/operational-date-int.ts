/* * */

import { DateTime } from 'luxon';
import { z } from 'zod';

import { CALENDAR_DATE_FORMAT } from './calendar-date.js';

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
	.transform(value => String(value).replaceAll('-', ''))
	.refine(value => DateTime.fromFormat(value, OPERATIONAL_DATE_FORMAT).isValid, { message: `Expected a date in the format ${OPERATIONAL_DATE_FORMAT} or ${CALENDAR_DATE_FORMAT}` })
	.transform(value => Number(value) as OperationalDateInt);

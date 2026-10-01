/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV29PeriodValues = [
	'1', // School Period
	'2', // School Holidays
	'3', // Summer Period
] as const;

export const GtfsStrictV29PeriodSchema = z.enum(GtfsStrictV29PeriodValues);

/**
 * Represents the period of a service in the GTFS strict v1 format.
 * The period indicates similar days in the year, like Summer Time or Winter Time.
 */
export type GtfsStrictV29Period = z.infer<typeof GtfsStrictV29PeriodSchema>;

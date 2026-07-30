/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV1PeriodValues = [
	'1', // School Period
	'2', // School Holidays
	'3', // Summer Period
] as const;

export const GtfsStrictV1PeriodSchema = z.enum(GtfsStrictV1PeriodValues);

/**
 * Represents the period of a service in the GTFS strict v1 format.
 * The period indicates similar days in the year, like Summer Time or Winter Time.
 */
export type GtfsStrictV1Period = z.infer<typeof GtfsStrictV1PeriodSchema>;

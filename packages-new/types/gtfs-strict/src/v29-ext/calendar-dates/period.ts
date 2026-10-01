/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV29ExtPeriodValues = [
	'1', // School Period
	'2', // School Holidays
	'3', // Summer Period
] as const;

export const GtfsStrictV29ExtPeriodSchema = z.enum(GtfsStrictV29ExtPeriodValues);

/**
 * Represents the period of a service in the GTFS strict v1 format.
 * The period indicates similar days in the year, like Summer Time or Winter Time.
 */
export type GtfsStrictV29ExtPeriod = z.infer<typeof GtfsStrictV29ExtPeriodSchema>;

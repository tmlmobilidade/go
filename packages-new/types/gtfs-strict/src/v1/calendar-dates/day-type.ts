/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV1DayTypeValues = [
	'1', // Weekday
	'2', // Saturday
	'3', // Sunday or Holiday
] as const;

export const GtfsStrictV1DayTypeSchema = z.enum(GtfsStrictV1DayTypeValues);

/**
 * Represents the type of day for a service in the GTFS strict v1 format.
 * The day type indicates whether a service is a weekday, Saturday, or Sunday or Holiday.
 */
export type GtfsStrictV1DayType = z.infer<typeof GtfsStrictV1DayTypeSchema>;

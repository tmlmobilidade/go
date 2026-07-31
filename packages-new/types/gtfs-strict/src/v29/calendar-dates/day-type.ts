/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV29DayTypeValues = [
	'1', // Weekday
	'2', // Saturday
	'3', // Sunday or Holiday
] as const;

export const GtfsStrictV29DayTypeSchema = z.enum(GtfsStrictV29DayTypeValues);

/**
 * Represents the type of day for a service in the GTFS strict v1 format.
 * The day type indicates whether a service is a weekday, Saturday, or Sunday or Holiday.
 */
export type GtfsStrictV29DayType = z.infer<typeof GtfsStrictV29DayTypeSchema>;

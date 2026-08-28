/* * */

import { z } from 'zod';

/* * */

export const GtfsExceptionTypeValues = [
	'1', // Service Added
	'2', // Service Removed
] as const;

export const GtfsExceptionTypeSchema = z.enum(GtfsExceptionTypeValues);

/**
 * Represents the type of exception for a service in the GTFS format.
 * The exception type indicates whether a service has been added
 * or removed for a specific date.
 */
export type GtfsExceptionType = z.infer<typeof GtfsExceptionTypeSchema>;

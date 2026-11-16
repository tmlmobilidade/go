/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV29ExtPeriodValues = [
	'1',
	'2',
	'3',
] as const;

export const GtfsStrictV29ExtPeriodSchema = z.enum(GtfsStrictV29ExtPeriodValues);

/**
 * Represents a numeric period identifier in GTFS v29.
 * Current Offer exports number each agency's periods independently; these values
 * do not imply school, school holidays or summer categories.
 */
export type GtfsStrictV29ExtPeriod = z.infer<typeof GtfsStrictV29ExtPeriodSchema>;

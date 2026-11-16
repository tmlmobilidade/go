/* * */

import { z } from 'zod';

/* * */

/** Legacy numeric values; the Offer v29 exporter assigns them per agency, sorted by Period code. */
export const GtfsStrictV29PeriodValues = [
	'1',
	'2',
	'3',
] as const;

export const GtfsStrictV29PeriodSchema = z.enum(GtfsStrictV29PeriodValues);

/**
 * Represents a numeric period identifier in GTFS v29.
 * Current Offer exports number each agency's periods independently; these values
 * do not imply school, school holidays or summer categories.
 */
export type GtfsStrictV29Period = z.infer<typeof GtfsStrictV29PeriodSchema>;

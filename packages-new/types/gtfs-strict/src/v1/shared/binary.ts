/* * */

import { z } from 'zod';

/* * */

export const GtfsBinaryValues = [
	'0', // NO
	'1', // YES
] as const;

export const GtfsBinarySchema = z.enum(GtfsBinaryValues);

/**
 * The GTFS Binary type represents a boolean value in the GTFS format.
 * The standard uses 0 and 1 to indicate either TRUE / FALSE or fields
 * with binary states, such as direction or availability.
 */
export type GtfsBinary = z.infer<typeof GtfsBinarySchema>;

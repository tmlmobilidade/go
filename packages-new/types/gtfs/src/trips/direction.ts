/* * */

import { z } from 'zod';

/* * */

export const GtfsTripDirectionValues = [
	'0', // INBOUND
	'1', // OUTBOUND
] as const;

export const GtfsTripDirectionSchema = z.enum(GtfsTripDirectionValues);

/**
 * The GTFS Trip Direction type represents the direction
 * of travel for a trip (e.g. inbound or outbound).
 * Valid options are `0` and `1`, without any specific meaning.
 * However, they should be consistent within trips for the same route.
 */
export type GtfsTripDirection = z.infer<typeof GtfsTripDirectionSchema>;

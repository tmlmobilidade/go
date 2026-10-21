/* * */

import { GtfsRouteTypeSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV30SteppRoutesSchema = z.object({
	agency_id: z.string(),
	route_desc: z.string(),
	route_id: z.string(),
	route_long_name: z.string(),
	route_short_name: z.string(),
	route_type: GtfsRouteTypeSchema,
});

/**
 * Represents a route in the custom GTFS strict v30 STEPP format.
 * It enforces certain fields that are optional in the standard GTFS format,
 * and adds the `continuous_drop_off` and `continuous_pickup` fields to be able to
 * accomodate multiple pickup and drop-off types for the same route.
 */
export type GtfsStrictV30SteppRoutes = z.infer<typeof GtfsStrictV30SteppRoutesSchema>;

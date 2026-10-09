/* * */

import { GtfsTernarySchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV30SteppTripsSchema = z.object({
	bikes_allowed: GtfsTernarySchema,
	block_id: z.string().optional(),
	direction_id: z.number(),
	route_id: z.string(),
	service_id: z.string(),
	shape_id: z.string(),
	trip_headsign: z.string().optional(),
	trip_id: z.string(),
	trip_short_name: z.string().optional(),
	wheelchair_accessible: GtfsTernarySchema,
});

/**
 * Represents a trip in the custom GTFS Strict v30 format.
 * A trip is the definition of a service of a given route,
 * scheduled to run on specific dates (`service_id`) and times (`stop_times`).
 * It also includes the `calendar_desc`, `pattern_id`, and `pattern_short_name` fields.
 */
export type GtfsStrictV30SteppTrips = z.infer<typeof GtfsStrictV30SteppTripsSchema>;

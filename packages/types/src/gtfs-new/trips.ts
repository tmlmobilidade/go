/* * */

import { z } from 'zod';

import { GtfsBinarySchema, GtfsTernarySchema } from '../gtfs/common.js';

/* * */

/**
 * Represents a trip in the GTFS (General Transit Feed Specification) format.
 * A trip is a sequence of one or more stops that a vehicle makes during its operation.
 * Each trip is associated with a specific route and service schedule.
 * The trip can have various attributes such as headsign, direction, and accessibility options.
 */
export const GtfsTripSchema = z.object({
	bikes_allowed: GtfsTernarySchema.nullish(),
	block_id: z.string().nullish(),
	direction_id: GtfsBinarySchema,
	route_id: z.string(),
	service_id: z.string(),
	shape_id: z.string(),
	trip_headsign: z.string().nullish(),
	trip_id: z.string(),
	trip_short_name: z.string().nullish(),
	wheelchair_accessible: GtfsTernarySchema,
});
export type GtfsTrip = z.infer<typeof GtfsTripSchema>;

/* * */

/**
 * Extended version of the GtfsTrip schema that
 * should be used for working with the GTFS-TML standard.
 */
export const GtfsTripExtendedSchema = GtfsTripSchema.extend({
	pattern_id: z.string(),
});
export type GtfsTripExtended = z.infer<typeof GtfsTripExtendedSchema>;

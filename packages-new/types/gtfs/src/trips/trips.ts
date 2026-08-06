/* * */

import { GtfsTernarySchema } from '@/shared/ternary.js';
import { GtfsTripDirectionSchema } from '@/trips/direction.js';
import { z } from 'zod';

/* * */

export const GtfsTripsSchema = z.object({
	bikes_allowed: GtfsTernarySchema.optional(),
	block_id: z.string().optional(),
	direction_id: GtfsTripDirectionSchema,
	route_id: z.string(),
	service_id: z.string(),
	shape_id: z.string(),
	trip_headsign: z.string().optional(),
	trip_id: z.string(),
	trip_short_name: z.string().optional(),
	wheelchair_accessible: GtfsTernarySchema.optional(),
});

/**
 * Represents a trip in the GTFS format.
 * A trip is the definition of a service of a given route,
 * scheduled to run on specific dates (`service_id`) and times (`stop_times`).
 * It can have various attributes such as headsign, direction, and accessibility options.
 */
export type GtfsTrips = z.infer<typeof GtfsTripsSchema>;

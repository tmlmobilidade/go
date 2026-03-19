/* * */

import { z } from 'zod';

import { GtfsRouteTypeSchema } from './route-type.js';

/* * */

const GtfsContinuousPickupDropOffSchema = z.union([
	z.literal(0), // Continuous stopping pickup/drop off.
	z.literal(1), // No continuous stopping pickup/drop off.
	z.literal(2), // Must phone agency to arrange.
	z.literal(3), // Must coordinate with driver.
]);

/**
 * Represents a route in the GTFS (General Transit Feed Specification) format.
 * A route is a group of trips that operate on a specific path or service,
 * typically identified by a unique route ID. Each route can have various attributes
 * such as agency ID, route color, long name, short name, and type of service.
 */
export const GtfsRouteSchema = z.object({
	// Conditionally required: required when the dataset contains multiple agencies.
	agency_id: z.string().nullish(),

	continuous_drop_off: GtfsContinuousPickupDropOffSchema.nullish(),
	continuous_pickup: GtfsContinuousPickupDropOffSchema.nullish(),

	route_color: z.string().nullish(),
	route_desc: z.string().nullish(),
	route_id: z.string(),
	route_long_name: z.string(),
	route_short_name: z.string(),
	route_sort_order: z.number().nullish(),
	route_text_color: z.string().nullish(),
	route_type: GtfsRouteTypeSchema,
	route_url: z.string().nullish(),
});
export type GtfsRoute = z.infer<typeof GtfsRouteSchema>;

/* * */

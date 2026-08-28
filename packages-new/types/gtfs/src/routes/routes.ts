/* * */

import { GtfsRouteTypeSchema } from '@/routes/route-type.js';
import { GtfsPickupDropoffTypeSchema } from '@/shared/pickup-dropoff-type.js';
import { GtfsTernarySchema } from '@/shared/ternary.js';
import { z } from 'zod';

/* * */

export const GtfsRoutesSchema = z.object({
	agency_id: z.string().default(''),
	cemv_support: GtfsTernarySchema.default('0'),
	continuous_drop_off: GtfsPickupDropoffTypeSchema.default('1'),
	continuous_pickup: GtfsPickupDropoffTypeSchema.default('1'),
	route_color: z.string().default(''),
	route_desc: z.string().default(''),
	route_id: z.string(),
	route_long_name: z.string().default(''),
	route_short_name: z.string().default(''),
	route_sort_order: z.number(),
	route_text_color: z.string().default(''),
	route_type: GtfsRouteTypeSchema,
	route_url: z.string().default(''),
});

/**
 * Represents a route in the GTFS format.
 * A route is a group of trips that operate on a specific path or service,
 * typically identified by a unique route ID. Each route can have various attributes
 * such as agency ID, route color, long name, short name, and type of service.
 */
export type GtfsRoutes = z.infer<typeof GtfsRoutesSchema>;

/* * */

import { NonNegativeIntegerSchema, nullAsUndefined } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsPickupDropoffTypeSchema } from '../shared/pickup-dropoff-type.js';
import { GtfsTernarySchema } from '../shared/ternary.js';
import { RouteColorSchema } from './route-color.js';
import { GtfsRouteTypeSchema } from './route-type.js';

/* * */

export const GtfsRoutesSchema = z.object({
	agency_id: nullAsUndefined(z.string().default('')),
	cemv_support: nullAsUndefined(GtfsTernarySchema.default('0')),
	continuous_drop_off: nullAsUndefined(GtfsPickupDropoffTypeSchema.default('1')),
	continuous_pickup: nullAsUndefined(GtfsPickupDropoffTypeSchema.default('1')),
	route_color: nullAsUndefined(RouteColorSchema.default('')),
	route_desc: nullAsUndefined(z.string().default('')),
	route_id: z.string(),
	route_long_name: nullAsUndefined(z.string().default('')),
	route_short_name: nullAsUndefined(z.string().default('')),
	route_sort_order: NonNegativeIntegerSchema.optional(),
	route_text_color: nullAsUndefined(RouteColorSchema.default('')),
	route_type: GtfsRouteTypeSchema,
	route_url: nullAsUndefined(z.string().default('')),
});

/**
 * Represents a route in the GTFS format.
 * A route is a group of trips that operate on a specific path or service,
 * typically identified by a unique route ID. Each route can have various attributes
 * such as agency ID, route color, long name, short name, and type of service.
 */
export type GtfsRoutes = z.infer<typeof GtfsRoutesSchema>;

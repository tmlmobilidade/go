/* * */

import { GtfsPickupDropoffTypeSchema, GtfsRouteTypeSchema, GtfsTernarySchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV30RoutesSchema = z.object({
	agency_id: z.string(),
	cemv_support: GtfsTernarySchema.optional().default('0'),
	continuous_drop_off: GtfsPickupDropoffTypeSchema.optional(),
	continuous_pickup: GtfsPickupDropoffTypeSchema.optional(),
	route_color: z.string(),
	route_desc: z.string(),
	route_id: z.string(),
	route_long_name: z.string(),
	route_short_name: z.string(),
	route_sort_order: z.number().optional(),
	route_text_color: z.string(),
	route_type: GtfsRouteTypeSchema,
});

/**
 * Represents a route in the custom GTFS strict v30 format.
 * It enforces certain fields that are optional in the standard GTFS format,
 * and adds the `continuous_drop_off` and `continuous_pickup` fields to be able to
 * accomodate multiple pickup and drop-off types for the same route.
 */
export type GtfsStrictV30Routes = z.infer<typeof GtfsStrictV30RoutesSchema>;

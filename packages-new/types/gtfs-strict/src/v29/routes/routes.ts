/* * */

import { GtfsStrictV29PathTypeSchema } from '@/v29/routes/path-type.js';
import { GtfsBinarySchema, GtfsRoutesSchema, GtfsRouteTypeSchema, GtfsTernarySchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV29RouteSchema = GtfsRoutesSchema.extend({
	agency_id: z.string(),
	cemv_support: GtfsTernarySchema,
	circular: GtfsBinarySchema.optional(),
	line_id: z.string(),
	line_long_name: z.string(),
	line_short_name: z.string(),
	line_type: z.number(),
	path_type: GtfsStrictV29PathTypeSchema.optional(),
	route_color: z.string(),
	route_destination: z.string().optional(),
	route_id: z.string(),
	route_long_name: z.string(),
	route_origin: z.string().optional(),
	route_remarks: z.string().optional(),
	route_short_name: z.string(),
	route_text_color: z.string(),
	route_type: GtfsRouteTypeSchema,
	school: GtfsBinarySchema.optional(),
});

/**
 * Represents a route in the custom GTFS strict v1 format.
 * It enforces certain fields that are optional in the standard GTFS format,
 * and adds the `continuous_drop_off` and `continuous_pickup` fields to be able to
 * accomodate multiple pickup and drop-off types for the same route.
 */
export type GtfsStrictV29Route = z.infer<typeof GtfsStrictV29RouteSchema>;

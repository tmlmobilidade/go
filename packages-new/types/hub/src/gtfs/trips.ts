/* * */

import { GtfsTernarySchema, GtfsTripDirectionSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportTripsSchema = z.object({
	bikes_allowed: GtfsTernarySchema.default('0'),
	block_id: z.string().optional(),
	cars_allowed: GtfsTernarySchema.default('0'),
	direction_id: GtfsTripDirectionSchema,
	pattern_id: z.string(),
	route_id: z.string(),
	service_id: z.string(),
	shape_id: z.string(),
	trip_headsign: z.string().default(''),
	trip_id: z.string(),
	trip_short_name: z.string().default(''),
	wheelchair_accessible: GtfsTernarySchema.default('0'),
});

/**
 * Representation of a GTFS trip for the Hub GTFS export that is being created.
 */
export type HubGtfsExportTripsInput = z.input<typeof HubGtfsExportTripsSchema>;

/**
 * Representation of a GTFS trip for the Hub GTFS export.
 */
export type HubGtfsExportTrips = z.output<typeof HubGtfsExportTripsSchema>;

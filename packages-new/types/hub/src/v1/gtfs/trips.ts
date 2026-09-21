/* * */

import { GtfsTernarySchema, GtfsTripDirectionSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubV1GtfsTripsSchema = z.object({
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
 * Representation of a GTFS trip for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsTripsInput = z.input<typeof HubV1GtfsTripsSchema>;

/**
 * Representation of a GTFS trip for the Hub V1 GTFS.
 */
export type HubV1GtfsTrips = z.output<typeof HubV1GtfsTripsSchema>;

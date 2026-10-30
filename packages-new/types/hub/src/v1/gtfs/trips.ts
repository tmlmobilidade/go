/* * */

import { GtfsTernarySchema, GtfsTripDirectionSchema } from '@tmlmobilidade/go-types-gtfs';
import { nullAsUndefined } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1GtfsTripsSchema = z.object({
	bikes_allowed: nullAsUndefined(GtfsTernarySchema.default('0')),
	block_id: nullAsUndefined(z.string().optional()),
	cars_allowed: nullAsUndefined(GtfsTernarySchema.default('0')),
	direction_id: GtfsTripDirectionSchema,
	pattern_id: z.string(),
	route_id: z.string(),
	service_id: z.string(),
	shape_id: z.string(),
	trip_headsign: nullAsUndefined(z.string().default('')),
	trip_id: z.string(),
	trip_short_name: nullAsUndefined(z.string().default('')),
	wheelchair_accessible: nullAsUndefined(GtfsTernarySchema.default('0')),
});

/**
 * Representation of a GTFS trip for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsTripsInput = z.input<typeof HubV1GtfsTripsSchema>;

/**
 * Representation of a GTFS trip for the Hub V1 GTFS.
 */
export type HubV1GtfsTrips = z.output<typeof HubV1GtfsTripsSchema>;

/* * */

import { nullAsUndefined } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsTernarySchema } from '../shared/ternary.js';
import { GtfsTripDirectionSchema } from './direction.js';

/* * */

export const GtfsTripsSchema = z.object({
	bikes_allowed: nullAsUndefined(GtfsTernarySchema.default('0')),
	block_id: nullAsUndefined(z.string().optional()),
	cars_allowed: nullAsUndefined(GtfsTernarySchema.default('0')),
	direction_id: GtfsTripDirectionSchema,
	route_id: z.string(),
	service_id: z.string(),
	shape_id: z.string(),
	trip_headsign: nullAsUndefined(z.string().default('')),
	trip_id: z.string(),
	trip_short_name: nullAsUndefined(z.string().default('')),
	wheelchair_accessible: nullAsUndefined(GtfsTernarySchema.default('0')),
});

/**
 * Represents a trip in the GTFS format.
 * A trip is the definition of a service of a given route,
 * scheduled to run on specific dates (`service_id`) and times (`stop_times`).
 * It can have various attributes such as headsign, direction, and accessibility options.
 */
export type GtfsTrips = z.infer<typeof GtfsTripsSchema>;

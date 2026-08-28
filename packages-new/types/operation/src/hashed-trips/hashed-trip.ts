/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { GtfsPickupDropoffTypeSchema, GtfsTimeSchema } from '@tmlmobilidade/go-types-gtfs';
import { NonNegativeFloatSchema, NonNegativeIntegerSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HashedTripSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	arrival_time: GtfsTimeSchema,
	departure_time: GtfsTimeSchema,
	drop_off_type: GtfsPickupDropoffTypeSchema,
	pickup_type: GtfsPickupDropoffTypeSchema,
	shape_dist_traveled: NonNegativeFloatSchema,
	shape_id: z.string(),
	stop_id: z.string(),
	stop_lat: LatitudeSchema,
	stop_lon: LongitudeSchema,
	stop_name: z.string(),
	stop_sequence: NonNegativeIntegerSchema,
	timepoint: z.boolean(),
	updated_at: UnixMillisecondsSchema,
});

/**
 * A HashedTrip represents the unique sequence of stops, and the arrival and departure times for each stop,
 * for a given set of trips. This is usually called a "pattern" in the public transit sector.
 * The hash here means that equal paths are considered equal, even if the GTFS plan where they are defined
 * is different. This allows for efficient data savings by not storing the same path multiple times,
 * and becomes considerable when GTFS plans are large and frequently updated.
 */
export type HashedTrip = z.infer<typeof HashedTripSchema>;

/* * */

export const CreateHashedTripSchema = HashedTripSchema.omit({
	_id: true,
	updated_at: true,
});

/**
 * A specific type for creating a HashedTrip, without the _id and updated_at fields.
 */
export type CreateHashedTrip = z.infer<typeof CreateHashedTripSchema>;

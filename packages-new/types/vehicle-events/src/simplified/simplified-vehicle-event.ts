/* * */

import { LatitudeSchema, LongitudeSchema, NonNegativeNumberSchema, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedVehicleEventSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	bearing: NonNegativeNumberSchema.nullable().default(null),
	created_at: UnixTimestampSchema,
	current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullable().default(null),
	driver_id: z.string().nullable().default(null),
	extra_trip_id: z.string().nullable().default(null),
	geohash: z.string().nullable().default(null),
	latitude: LatitudeSchema,
	longitude: LongitudeSchema,
	odometer: NonNegativeNumberSchema.nullable().default(null),
	operational_date: OperationalDateIntSchema,
	received_at: UnixTimestampSchema,
	speed: NonNegativeNumberSchema.nullable().default(null),
	stop_id: z.string().nullable().default(null),
	trip_id: z.string(),
	vehicle_id: z.string(),
});

/**
 * Simplified Vehicle Events are data structures that represent the essential
 * information about a vehicle's status and location at a given time. They are derived
 * from the raw vehicle events produced by the vehicle's on-board computer, but they
 * have been processed and simplified to include only the most relevant fields for analysis
 * and reporting purposes. These events are used to track the vehicle's location, speed
 * and status, as well as the current service being provided by the vehicle.
 */
export type SimplifiedVehicleEvent = z.infer<typeof SimplifiedVehicleEventSchema>;

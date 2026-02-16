/* * */

import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const SimplifiedVehicleEventSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	bearing: z.number().nullable().default(null),
	created_at: UnixTimeStampSchema,
	current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']),
	door: z.string().nullable().default(null),
	driver_id: z.string().nullable().default(null),
	extra_trip_id: z.string().nullable().default(null),
	latitude: z.number(),
	longitude: z.number(),
	odometer: z.number().nullable().default(null),
	pattern_id: z.string().nullable().default(null),
	received_at: UnixTimeStampSchema,
	stop_id: z.string(),
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

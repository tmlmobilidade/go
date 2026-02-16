/* * */

import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixTimeStampSchema,
	data: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	received_at: UnixTimeStampSchema,
	trip_id: z.string(),
	vehicle_id: z.string(),
});

/**
 * Vehicle Events are produced by the vehicle's on-board computer on a regular schedule
 * or whenever a significant event occurs. These events are used to track the vehicle's
 * location, speed, and status, as well as the current service being provided by the vehicle.
 * These events are based on the GTFS-RT specification but extended with additional fields
 * specific to TML's needs.
 */
export type RawVehicleEvent = z.infer<typeof RawVehicleEventSchema>;

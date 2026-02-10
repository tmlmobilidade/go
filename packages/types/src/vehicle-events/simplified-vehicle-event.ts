/* * */

import { DocumentSchema } from '@/_common/document.js';
import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const SimplifiedVehicleEventSchema = DocumentSchema
	.omit({
		created_by: true,
		is_locked: true,
		updated_at: true,
		updated_by: true,
	})
	.extend({
		agency_id: z.string(),
		bearing: z.number().nullable().default(null),
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
 * Vehicle Events are produced by the vehicle's on-board computer on a regular schedule
 * or whenever a significant event occurs. These events are used to track the vehicle's
 * location, speed, and status, as well as the current service being provided by the vehicle.
 * These events are based on the GTFS-RT specification but extended with additional fields
 * specific to TML's needs.
 */
export type SimplifiedVehicleEvent = z.infer<typeof SimplifiedVehicleEventSchema>;

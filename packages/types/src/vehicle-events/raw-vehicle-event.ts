/* * */

import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixTimeStampSchema,
	entity_id: z.any(),
	raw: z.any(),
	received_at: UnixTimeStampSchema,
	version: z.string().optional(),
});

/**
 * Vehicle Events are produced by the vehicle's on-board computer on a regular schedule
 * or whenever a significant event occurs. These events are used to track the vehicle's
 * location, speed, and status, as well as the current service being provided by the vehicle.
 * These events are based on the GTFS-RT specification but extended with additional fields
 * specific to TML's needs.
 */
export type RawVehicleEvent = z.infer<typeof RawVehicleEventSchema>;

/* * */

export const HashableRawVehicleEventSchema = RawVehicleEventSchema.omit({
	_id: true,
	received_at: true,
});

/**
 * A HashableRawVehicleEvent is a RawVehicleEvent without the _id and received_at fields,
 * which are not relevant for hashing purposes. This type is used to create a unique hash
 * for each vehicle event based on its content, allowing us to identify duplicate events
 * and avoid storing them multiple times in the database.
 */
export type HashableRawVehicleEvent = z.infer<typeof HashableRawVehicleEventSchema>;

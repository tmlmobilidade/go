/* * */

import { GtfsRtOccupancyStatusSchema } from '@/gtfs-rt/occupancy-status.js';
import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventCcflV1PayloadSchema = z.object({
	header: z.object({
		feed_version: z.string().nullish(),
		gtfs_realtime_version: z.string(),
		incrementality: z.literal('FULL_DATASET'),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullish(),
		occupancy_status: GtfsRtOccupancyStatusSchema.nullish(),
		position: z.object({
			bearing: z.number().nullish(),
			latitude: z.number(),
			longitude: z.number(),
			speed: z.number().nullish(),
		}),
		stop_id: z.string().nullish(),
		timestamp: z.number().nullish(),
		trip: z.object({
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
			label: z.string(),
		}),
	}),
});

export type RawVehicleEventCcflV1Payload = z.infer<typeof RawVehicleEventCcflV1PayloadSchema>;

/* * */

export const RawVehicleEventCcflV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventCcflV1PayloadSchema,
	version: z.literal('ccfl-v1'),
});

export type RawVehicleEventCcflV1 = z.infer<typeof RawVehicleEventCcflV1Schema>;

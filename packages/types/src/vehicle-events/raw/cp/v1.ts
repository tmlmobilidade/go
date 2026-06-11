/* * */

import { GtfsRtOccupancyStatusSchema } from '@/gtfs-rt/occupancy-status.js';
import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const RawVehicleEventCpV1PayloadSchema = z.object({
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
		}),
		timestamp: z.number().nullish(),
		trip: z.object({
			schedule_relationship: z.enum(['SCHEDULED', 'NOT_SCHEDULED', 'CANCELED']).nullish(),
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
		}),
	}),
});

export type RawVehicleEventCpV1Payload = z.infer<typeof RawVehicleEventCpV1PayloadSchema>;

/* * */

export const RawVehicleEventCpV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventCpV1PayloadSchema,
	version: z.literal('cp-v1'),
});

export type RawVehicleEventCpV1 = z.infer<typeof RawVehicleEventCpV1Schema>;

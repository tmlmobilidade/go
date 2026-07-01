/* * */

import { OperationalDateSchema } from '@/index.js';
import { RawVehicleEventBaseSchema } from '@/vehicle-events/raw/raw-vehicle-event-base.js';
import { GtfsDateSchema, GtfsTimeSchema } from '@tmlmobilidade/go-types-gtfs';
import { GtfsRtOccupancyStatusSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { z } from 'zod';

/* * */

export const RawVehicleEventTcbV1PayloadSchema = z.object({
	header: z.object({
		feed_version: z.string().nullish(),
		gtfs_realtime_version: z.string(),
		incrementality: z.literal('FULL_DATASET').nullish(),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullish(),
		current_stop_sequence: z.number().nullish(),
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
			direction_id: z.number().nullish(),
			route_id: z.string(),
			start_date: GtfsDateSchema.nullish(),
			start_time: GtfsTimeSchema.nullish(),
			trip_id: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
		}),
	}),
});

export type RawVehicleEventTcbV1Payload = z.infer<typeof RawVehicleEventTcbV1PayloadSchema>;

/* * */

export const RawVehicleEventTcbV1Schema = RawVehicleEventBaseSchema.extend({
	payload: RawVehicleEventTcbV1PayloadSchema,
	version: z.literal('tcb-v1'),
});

export type RawVehicleEventTcbV1 = z.infer<typeof RawVehicleEventTcbV1Schema>;

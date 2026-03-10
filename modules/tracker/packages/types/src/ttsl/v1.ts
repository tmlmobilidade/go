/* * */

import { TrackerVehicleEventBaseSchema } from '@/common/vehicle-event-base.js';
import { z } from 'zod';

/* * */

export const TrackerTtslV1RawSchema = z.object({
	header: z.object({
		gtfsRealtimeVersion: z.literal('2.0'),
		incrementality: z.literal('DIFFERENTIAL'),
		timestamp: z.number(),
	}),
	vehicle: z.object({
		currentStatus: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']),
		occupancyStatus: z.enum(['EMPTY', 'PARTIALLY_OCCUPIED', 'FULL']),
		position: z.object({
			bearing: z.number(),
			latitude: z.number(),
			longitude: z.number(),
			speed: z.number(),
		}),
		stopId: z.string(),
		timestamp: z.number(),
		trip: z.object({
			tripId: z.string(),
		}),
		vehicle: z.object({
			id: z.string(),
			label: z.string(),
		}),
	}),
});

export type TrackerTtslV1Raw = z.infer<typeof TrackerTtslV1RawSchema>;

/* * */

export const TrackerTtslV1Schema = TrackerVehicleEventBaseSchema.extend({
	raw: TrackerTtslV1RawSchema,
	version: z.literal('ttsl-v1'),
});

export type TrackerTtslV1 = z.infer<typeof TrackerTtslV1Schema>;

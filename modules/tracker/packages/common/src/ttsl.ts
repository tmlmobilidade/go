/* * */

import { z } from 'zod';

import { TrackerVehicleEventBaseSchema } from './vehicle-event-base.js';

/* * */

export const TrackerTtslV1RawSchema = z.object({
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
});

export type TrackerTtslV1Raw = z.infer<typeof TrackerTtslV1RawSchema>;

/* * */

export const TrackerTtslV1Schema = TrackerVehicleEventBaseSchema.extend({
	raw: TrackerTtslV1RawSchema,
	version: z.literal('ttsl-v1'),
});

/* * */

import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { OperationalDateSchema } from '@/index.js';
import { z } from 'zod';

/* * */

export const HubVehiclePositionSchema = z.object({

	//
	// Required Fields

	_id: z.string(),
	agency_id: z.string(),
	calendar_date: OperationalDateSchema,
	created_at: UnixTimestampSchema,
	geohash: z.string().nullish(),
	latitude: z.number()
		.min(-90)
		.max(90)
		.refine(value => value.toFixed(6) === value.toString()),
	longitude: z.number()
		.min(-180)
		.max(180)
		.refine(value => value.toFixed(6) === value.toString()),
	received_at: UnixTimestampSchema,
	trip_id: z.string(),
	vehicle_id: z.string(),

	//
	// Optional Fields

	bearing: z.number().nullable().default(null),
	current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullable().default(null),
	speed: z.number().nullable().default(null),
	stop_id: z.string().nullable().default(null),

});

/**
 * Publishable plan data for the Hub Plans API.
 */
export type HubVehiclePosition = z.infer<typeof HubVehiclePositionSchema>;


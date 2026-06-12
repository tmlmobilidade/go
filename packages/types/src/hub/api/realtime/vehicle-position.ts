/* * */

import { CalendarDateSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubVehiclePositionSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	bearing: z.number().nullable().default(null),
	calendar_date: CalendarDateSchema,
	created_at: UnixTimestampSchema,
	current_status: z.enum(['INCOMING_AT', 'STOPPED_AT', 'IN_TRANSIT_TO']).nullable().default(null),
	geohash: z.string().nullable().default(null),
	latitude: z.number()
		.min(-90)
		.max(90)
		.transform(value => value.toFixed(6))
		.transform(value => parseFloat(value)),
	line_id: z.string().nullable().default(null),
	longitude: z.number()
		.min(-180)
		.max(180)
		.transform(value => value.toFixed(6))
		.transform(value => parseFloat(value)),
	pattern_id: z.string().nullable().default(null),
	received_at: UnixTimestampSchema,
	ride_id: z.string().nullable().default(null),
	speed: z.number().nullable().default(null),
	stop_id: z.string().nullable().default(null),
	trip_id: z.string(),
	vehicle_id: z.string(),
});

/**
 * Publishable plan data for the Hub Plans API.
 */
export type HubVehiclePosition = z.infer<typeof HubVehiclePositionSchema>;


/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { GtfsTripDirectionSchema } from '@tmlmobilidade/go-types-gtfs';
import { GtfsRtVehicleStopStatusSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { CalendarDateSchema, NonNegativeIntegerSchema, OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubVehiclePositionSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	bearing: NonNegativeIntegerSchema.nullable().default(null),
	calendar_date: CalendarDateSchema,
	created_at: UnixTimestampSchema,
	current_status: GtfsRtVehicleStopStatusSchema.nullable().default(null),
	direction_id: GtfsTripDirectionSchema.nullable().default(null),
	geohash: z.string().nullable().default(null),
	latitude: LatitudeSchema,
	longitude: LongitudeSchema,
	operational_date: OperationalDateIntSchema,
	received_at: UnixTimestampSchema,
	ride_id: z.string().nullable().default(null),
	route_id: z.string().nullable().default(null),
	route_short_name: z.string().nullable().default(null),
	shape_id: z.string().nullable().default(null),
	speed: NonNegativeIntegerSchema.nullable().default(null),
	stop_id: z.string().nullable().default(null),
	trip_id: z.string(),
	vehicle_id: z.string(),
});

/**
 * Vehicle Position item for the Hub Realtime API.
 */
export type HubVehiclePosition = z.infer<typeof HubVehiclePositionSchema>;


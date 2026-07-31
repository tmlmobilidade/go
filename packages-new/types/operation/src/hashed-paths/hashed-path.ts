/* * */

import { GtfsPickupDropoffTypeSchema, GtfsTimeSchema } from '@tmlmobilidade/go-types-gtfs';
import { LatitudeSchema, LongitudeSchema, NonNegativeNumberSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HashedPathSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	arrival_time: GtfsTimeSchema,
	created_at: UnixTimestampSchema,
	departure_time: GtfsTimeSchema,
	drop_off_type: GtfsPickupDropoffTypeSchema,
	pickup_type: GtfsPickupDropoffTypeSchema,
	shape_dist_traveled: NonNegativeNumberSchema,
	stop_id: z.string(),
	stop_lat: LatitudeSchema,
	stop_lon: LongitudeSchema,
	stop_name: z.string(),
	stop_sequence: NonNegativeNumberSchema,
	timepoint: z.boolean(),
	updated_at: UnixTimestampSchema,
});

export type HashedPath = z.infer<typeof HashedPathSchema>;

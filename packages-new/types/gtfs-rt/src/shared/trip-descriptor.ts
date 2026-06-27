/* * */

import { GtfsRtScheduleRelationshipSchema } from '@/shared/schedule-relationship.js';
import { GtfsDateSchema, GtfsTimeSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsRtTripDescriptorSchema = z.object({
	direction_id: z.any(),
	modified_trip: z.any(),
	route_id: z.string(),
	schedule_relationship: GtfsRtScheduleRelationshipSchema.nullish(),
	start_date: GtfsDateSchema,
	start_time: GtfsTimeSchema.nullish(),
	trip_id: z.string(),
});

export type GtfsRtTripDescriptor = z.infer<typeof GtfsRtTripDescriptorSchema>;

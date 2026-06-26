/* * */

import { GtfsRtTripDescriptorSchema } from '@/shared/trip-descriptor.js';
import { z } from 'zod';

/* * */

export const GtfsRtEntitySelectorSchema = z.object({
	agency_id: z.string().nullish(),
	direction_id: z.number().nullish(),
	route_id: z.string().nullish(),
	route_type: z.number().nullish(),
	stop_id: z.string().nullish(),
	trip: GtfsRtTripDescriptorSchema.nullish(),
});

export type GtfsRtEntitySelector = z.infer<typeof GtfsRtEntitySelectorSchema>;

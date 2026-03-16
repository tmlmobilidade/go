/* * */

import { OperationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

/* * */

export const GtfsRtTripDescriptorSchema = z.object({
	direction_id: z.any(),
	modified_trip: z.any(),
	route_id: z.string(),
	schedule_relationship: z.any(),
	start_date: OperationalDateSchema,
	start_time: z.any(),
	trip_id: z.string(),
});

export type GtfsRtTripDescriptor = z.infer<typeof GtfsRtTripDescriptorSchema>;

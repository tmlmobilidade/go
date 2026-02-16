/* * */

import { z } from 'zod';

/* * */

export const GtfsRtTripDescriptorSchema = z.object({
	direction_id: z.any(),
	modified_trip: z.any(),
	route_id: z.any(),
	schedule_relationship: z.any(),
	start_date: z.any(),
	start_time: z.any(),
	trip_id: z.any(),
});

export type GtfsRtTripDescriptor = z.infer<typeof GtfsRtTripDescriptorSchema>;

/* * */

import { GtfsRtOccupancyStatusSchema } from '@/vehicle-position/occupancy-status.js';
import { z } from 'zod';

/* * */

export const GtfsRtCarriageDetailsSchema = z.object({
	carriage_sequence: z.number(),
	id: z.string().nullish(),
	label: z.string().nullish(),
	occupancy_percentage: z.number().nullish(),
	occupancy_status: GtfsRtOccupancyStatusSchema.nullish(),
});

export type GtfsRtCarriageDetails = z.infer<typeof GtfsRtCarriageDetailsSchema>;

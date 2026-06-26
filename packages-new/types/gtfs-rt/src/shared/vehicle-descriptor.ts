/* * */

import { GtfsRtWheelchairAccessibleSchema } from '@/shared/wheelchair-accessible.js';
import { z } from 'zod';

/* * */

export const GtfsRtVehicleDescriptorSchema = z.object({
	id: z.string(),
	label: z.string().nullish(),
	license_plate: z.string().nullish(),
	wheelchair_accessible: GtfsRtWheelchairAccessibleSchema,
});

export type GtfsRtVehicleDescriptor = z.infer<typeof GtfsRtVehicleDescriptorSchema>;

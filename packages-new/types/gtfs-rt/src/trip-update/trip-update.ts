/* * */

import { GtfsRtTripDescriptorSchema } from '@/shared/trip-descriptor.js';
import { GtfsRtVehicleDescriptorSchema } from '@/shared/vehicle-descriptor.js';
import { GtfsRtStopTimeUpdateSchema } from '@/trip-update/stop-time-update.js';
import { GtfsRtTripPropertiesSchema } from '@/trip-update/trip-properties.js';
import { z } from 'zod';

/* * */

export const GtfsRtTripUpdateSchema = z.object({
	delay: z.number().nullish(),
	stop_time_update: z.array(GtfsRtStopTimeUpdateSchema).nullish(),
	timestamp: z.number().nullish(),
	trip: GtfsRtTripDescriptorSchema,
	trip_properties: GtfsRtTripPropertiesSchema.nullish(),
	vehicle: GtfsRtVehicleDescriptorSchema,
});

export type GtfsRtTripUpdate = z.infer<typeof GtfsRtTripUpdateSchema>;

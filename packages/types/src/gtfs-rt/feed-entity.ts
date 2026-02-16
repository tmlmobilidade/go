/* * */

import { GtfsRtAlertSchema } from '@/gtfs-rt/alert.js';
import { GtfsRtVehiclePositionSchema } from '@/gtfs-rt/vehicle-position.js';
import { z } from 'zod';

/* * */

export const GtfsRtFeedEntitySchema = z.object({
	alert: GtfsRtAlertSchema.nullish(),
	id: z.string(),
	trip_update: z.any().nullish(),
	vehicle: GtfsRtVehiclePositionSchema.nullish(),
});

export type GtfsRtFeedEntity = z.infer<typeof GtfsRtFeedEntitySchema>;

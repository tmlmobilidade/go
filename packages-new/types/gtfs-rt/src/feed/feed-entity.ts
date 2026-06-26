/* * */

import { GtfsRtAlertSchema } from '@/alert/alert.js';
import { GtfsRtTripUpdateSchema } from '@/trip-update/trip-update.js';
import { GtfsRtVehiclePositionSchema } from '@/vehicle-position/vehicle-position.js';
import { z } from 'zod';

/* * */

export const GtfsRtFeedEntitySchema = z.object({
	alert: GtfsRtAlertSchema.nullish(),
	id: z.string(),
	trip_update: GtfsRtTripUpdateSchema.nullish(),
	vehicle: GtfsRtVehiclePositionSchema.nullish(),
	// shape: GtfsRtShapeSchema.nullish(),
	// stop: GtfsRtStopSchema.nullish(),
	// trip_modifications: GtfsRtTripModificationsSchema.nullish(),
});

export type GtfsRtFeedEntity = z.infer<typeof GtfsRtFeedEntitySchema>;

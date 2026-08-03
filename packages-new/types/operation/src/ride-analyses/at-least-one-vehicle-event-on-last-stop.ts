/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisAtLeastOneVehicleEventOnLastStopSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'NO_VEHICLE_EVENTS_ON_LAST_STOP', 'ONE_OR_MORE_VEHICLE_EVENTS_ON_LAST_STOP']),
	vehicle_events_on_last_stop_qty: NonNegativeNumberSchema.nullable(),
});

/**
 * Tests whether there is at least one vehicle event inside the geofence of the last stop of the ride.
 * @param vehicle_events_on_last_stop_qty The number of vehicle events found to be inside the geofence of the last stop of the ride.
 */
export type RideAnalysisAtLeastOneVehicleEventOnLastStop = z.infer<typeof RideAnalysisAtLeastOneVehicleEventOnLastStopSchema>;

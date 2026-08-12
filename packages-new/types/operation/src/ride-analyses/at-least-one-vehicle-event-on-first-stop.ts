/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/ride-analysis-base.js';
import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisAtLeastOneVehicleEventOnFirstStopSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'NO_VEHICLE_EVENTS_ON_FIRST_STOP', 'ONE_OR_MORE_VEHICLE_EVENTS_ON_FIRST_STOP']).nullable().default(null),
	vehicle_events_on_first_stop_qty: NonNegativeIntegerSchema.nullable().default(null),
});

/**
 * Tests whether there is at least one vehicle event inside the geofence of the first stop of the ride.
 * @param vehicle_events_on_first_stop_qty The number of vehicle events found to be inside the geofence of the first stop of the ride.
 */
export type RideAnalysisAtLeastOneVehicleEventOnFirstStop = z.infer<typeof RideAnalysisAtLeastOneVehicleEventOnFirstStopSchema>;

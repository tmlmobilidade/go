/* * */

import { RideAnalysisBaseSchema } from '@/rides/analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisAtLeastOneVehicleEventOnFirstStopSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'NO_VEHICLE_EVENTS_ON_FIRST_STOP', 'ONE_OR_MORE_VEHICLE_EVENTS_ON_FIRST_STOP']),
	value: z.number().nullable(),
});

export type RideAnalysisAtLeastOneVehicleEventOnFirstStop = z.infer<typeof RideAnalysisAtLeastOneVehicleEventOnFirstStopSchema>;

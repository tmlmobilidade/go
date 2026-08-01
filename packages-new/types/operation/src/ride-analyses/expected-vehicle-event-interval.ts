/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedVehicleEventIntervalSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS', 'EXPECTED_VEHICLE_EVENT_INTERVAL', 'UNEXPECTED_VEHICLE_EVENT_INTERVAL']),
	value: z.number().nullable(),
});

export type RideAnalysisExpectedVehicleEventInterval = z.infer<typeof RideAnalysisExpectedVehicleEventIntervalSchema>;

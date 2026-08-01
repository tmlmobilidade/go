/* * */

import { RideAnalysisBaseSchema } from '@/rides/analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedVehicleEventDelaySchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS', 'UNEXPECTED_VEHICLE_EVENTS_DELAY', 'EXPECTED_VEHICLE_EVENTS_DELAY']).nullable(),
	value: z.number().nullable(),
});

export type RideAnalysisExpectedVehicleEventDelay = z.infer<typeof RideAnalysisExpectedVehicleEventDelaySchema>;

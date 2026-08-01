/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisMatchingVehicleIdsSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['MATCHING_VEHICLE_IDS', 'VEHICLE_ID_MISMATCH', 'NO_VEHICLE_EVENTS', 'NO_APEX_TRANSACTIONS']).nullable(),
});

export type RideAnalysisMatchingVehicleIds = z.infer<typeof RideAnalysisMatchingVehicleIdsSchema>;

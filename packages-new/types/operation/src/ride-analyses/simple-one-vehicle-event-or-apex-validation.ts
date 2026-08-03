/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisSimpleOneVehicleEventOrApexValidationSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS_OR_APEX_VALIDATIONS', 'FOUND_VEHICLE_EVENT_OR_APEX_VALIDATION']).nullable(),
});

/**
 * Tests whether there is at least one vehicle event or APEX validation.
 */
export type RideAnalysisSimpleOneVehicleEventOrApexValidation = z.infer<typeof RideAnalysisSimpleOneVehicleEventOrApexValidationSchema>;

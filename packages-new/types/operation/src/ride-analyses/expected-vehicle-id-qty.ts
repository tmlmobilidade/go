/* * */

import { RideAnalysisBaseSchema } from '@/rides/analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedVehicleIdQtySchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS', 'NO_APEX_VALIDATIONS', 'UNEXPECTED_VEHICLE_ID_QTY', 'EXPECTED_VEHICLE_ID_QTY']),
	value: z.number().nullable(),
});

export type RideAnalysisExpectedVehicleIdQty = z.infer<typeof RideAnalysisExpectedVehicleIdQtySchema>;

/* * */

import { RideAnalysisBaseSchema } from '@/rides/analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedVehicleEventQtySchema = RideAnalysisBaseSchema.extend({
	expected_qty: z.number().nullable(),
	found_qty: z.number().nullable(),
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'EXPECTED_VEHICLE_EVENT_QTY', 'UNEXPECTED_VEHICLE_EVENT_QTY']).nullable(),
});

export type RideAnalysisExpectedVehicleEventQty = z.infer<typeof RideAnalysisExpectedVehicleEventQtySchema>;

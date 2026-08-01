/* * */

import { RideAnalysisBaseSchema } from '@/rides/analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedDriverIdQtySchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_VEHICLE_EVENTS', 'UNEXPECTED_DRIVER_ID_QTY', 'EXPECTED_DRIVER_ID_QTY']),
	value: z.number(),
});

export type RideAnalysisExpectedDriverIdQty = z.infer<typeof RideAnalysisExpectedDriverIdQtySchema>;

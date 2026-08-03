/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedDriverIdQtySchema = RideAnalysisBaseSchema.extend({
	observed_driver_ids_qty: NonNegativeNumberSchema.nullable(),
	reason: z.enum(['NO_VEHICLE_EVENTS', 'UNEXPECTED_DRIVER_ID_QTY', 'EXPECTED_DRIVER_ID_QTY']),
});

/**
 * Tests whether the number of driver IDs is as expected.
 * @param observed_driver_ids_qty The number of driver IDs observed.
 */
export type RideAnalysisExpectedDriverIdQty = z.infer<typeof RideAnalysisExpectedDriverIdQtySchema>;

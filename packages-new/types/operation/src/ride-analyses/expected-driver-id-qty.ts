/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/ride-analysis-base.js';
import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedDriverIdQtySchema = RideAnalysisBaseSchema.extend({
	observed_driver_ids_qty: NonNegativeIntegerSchema.nullable().default(null),
	reason: z.enum(['NO_VEHICLE_EVENTS', 'UNEXPECTED_DRIVER_ID_QTY', 'EXPECTED_DRIVER_ID_QTY']).nullable().default(null),
});

/**
 * Tests whether the number of driver IDs is as expected.
 * @param observed_driver_ids_qty The number of driver IDs observed.
 */
export type RideAnalysisExpectedDriverIdQty = z.infer<typeof RideAnalysisExpectedDriverIdQtySchema>;

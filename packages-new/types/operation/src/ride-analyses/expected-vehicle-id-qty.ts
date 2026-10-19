/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/ride-analysis-base.js';
import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedVehicleIdQtySchema = RideAnalysisBaseSchema.extend({
	observed_vehicle_ids_qty: NonNegativeIntegerSchema.nullable().default(null),
	reason: z.enum(['NO_VEHICLE_EVENTS', 'NO_APEX_VALIDATIONS', 'UNEXPECTED_VEHICLE_ID_QTY', 'EXPECTED_VEHICLE_ID_QTY']).nullable().default(null),
});

/**
 * Tests whether the number of vehicle IDs is as expected.
 * @param observed_vehicle_ids_qty The number of vehicle IDs observed.
 */
export type RideAnalysisExpectedVehicleIdQty = z.infer<typeof RideAnalysisExpectedVehicleIdQtySchema>;

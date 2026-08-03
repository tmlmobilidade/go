/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedVehicleEventQtySchema = RideAnalysisBaseSchema.extend({
	expected_vehicle_events_qty: NonNegativeNumberSchema.nullable(),
	observed_vehicle_events_qty: NonNegativeNumberSchema.nullable(),
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'EXPECTED_VEHICLE_EVENT_QTY', 'UNEXPECTED_VEHICLE_EVENT_QTY']).nullable(),
});

/**
 * Tests whether the number of vehicle events is as expected, taking into account
 * the number of stops in the path data and the scheduled duration of the ride.
 * @param expected_vehicle_events_qty The expected number of vehicle events.
 * @param observed_vehicle_events_qty The observed number of vehicle events.
 */
export type RideAnalysisExpectedVehicleEventQty = z.infer<typeof RideAnalysisExpectedVehicleEventQtySchema>;

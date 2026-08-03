/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedVehicleEventIntervalSchema = RideAnalysisBaseSchema.extend({
	observed_average_interval: NonNegativeNumberSchema.nullable(),
	observed_max_interval: NonNegativeNumberSchema.nullable(),
	observed_min_interval: NonNegativeNumberSchema.nullable(),
	reason: z.enum(['NO_VEHICLE_EVENTS', 'EXPECTED_VEHICLE_EVENT_INTERVAL', 'UNEXPECTED_VEHICLE_EVENT_INTERVAL']),
});

/**
 * Tests whether the average interval observed between vehicle events is as expected.
 * @param observed_average_interval The average interval observed between vehicle events, in seconds.
 * @param observed_max_interval The maximum interval observed between vehicle events, in seconds.
 * @param observed_min_interval The minimum interval observed between vehicle events, in seconds.
 */
export type RideAnalysisExpectedVehicleEventInterval = z.infer<typeof RideAnalysisExpectedVehicleEventIntervalSchema>;

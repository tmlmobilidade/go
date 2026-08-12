/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/ride-analysis-base.js';
import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedVehicleEventDelaySchema = RideAnalysisBaseSchema.extend({
	observed_average_delay: NonNegativeIntegerSchema.nullable().default(null),
	observed_max_delay: NonNegativeIntegerSchema.nullable().default(null),
	observed_min_delay: NonNegativeIntegerSchema.nullable().default(null),
	reason: z.enum(['NO_VEHICLE_EVENTS', 'UNEXPECTED_VEHICLE_EVENTS_DELAY', 'EXPECTED_VEHICLE_EVENTS_DELAY']).nullable().default(null),
	vehicle_events_qty: NonNegativeIntegerSchema.nullable().default(null),
	vehicle_events_with_delay_percent: NonNegativeIntegerSchema.nullable().default(null),
	vehicle_events_with_delay_qty: NonNegativeIntegerSchema.nullable().default(null),
});

/**
 * Tests whether the average delay observed between vehicle events received by the system is as expected.
 * @param observed_average_delay The average delay observed between vehicle events, in seconds.
 * @param observed_max_delay The maximum delay observed between vehicle events, in seconds.
 * @param observed_min_delay The minimum delay observed between vehicle events, in seconds.
 */
export type RideAnalysisExpectedVehicleEventDelay = z.infer<typeof RideAnalysisExpectedVehicleEventDelaySchema>;

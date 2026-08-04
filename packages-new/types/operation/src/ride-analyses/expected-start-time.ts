/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/ride-analysis-base.js';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedStartTimeSchema = RideAnalysisBaseSchema.extend({
	observed_start_time: UnixTimestampSchema.nullable().default(null),
	observed_start_time_delta: z.number().nullable().default(null),
	reason: z.enum(['NO_START_TIME_SCHEDULED', 'NO_VEHICLE_EVENTS', 'UNKNOWN_START', 'EARLY_START', 'LATE_START', 'START_ON_TIME']).nullable().default(null),
});

/**
 * Tests whether the start time is as expected.
 * @param observed_start_time The observed start time as a Unix timestamp.
 * @param observed_start_time_delta The observed start time delta, in seconds.
 */
export type RideAnalysisExpectedStartTime = z.infer<typeof RideAnalysisExpectedStartTimeSchema>;

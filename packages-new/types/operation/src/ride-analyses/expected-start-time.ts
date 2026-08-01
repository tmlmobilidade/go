/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedStartTimeSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_START_TIME_SCHEDULED', 'NO_VEHICLE_EVENTS', 'UNKNOWN_START', 'EARLY_START', 'LATE_START', 'START_ON_TIME']).nullable(),
	value: z.number().nullable(),
});

export type RideAnalysisExpectedStartTime = z.infer<typeof RideAnalysisExpectedStartTimeSchema>;

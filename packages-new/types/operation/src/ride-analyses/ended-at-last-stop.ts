/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisEndedAtLastStopSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'ENDED_AT_LAST_STOP', 'ENDED_OUTSIDE_OF_LAST_STOP']).nullable(),
});

export type RideAnalysisEndedAtLastStop = z.infer<typeof RideAnalysisEndedAtLastStopSchema>;

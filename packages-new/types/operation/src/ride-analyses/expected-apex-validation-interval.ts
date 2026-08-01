/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedApexValidationIntervalSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_APEX_VALIDATIONS', 'NOT_ENOUGH_VALIDATIONS', 'INTERVALS_TOO_SHORT', 'NON_ORGANIC_INTERVALS', 'EXPECTED_VALIDATION_INTERVALS']).nullable(),
});

export type RideAnalysisExpectedApexValidationInterval = z.infer<typeof RideAnalysisExpectedApexValidationIntervalSchema>;

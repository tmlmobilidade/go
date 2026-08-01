/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisSimpleOneApexValidationSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_APEX_VALIDATIONS', 'ONE_OR_MORE_APEX_VALIDATIONS']).nullable(),
	value: z.number().nullable(),
});

export type RideAnalysisSimpleOneApexValidation = z.infer<typeof RideAnalysisSimpleOneApexValidationSchema>;

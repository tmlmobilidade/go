/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/ride-analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisSimpleOneApexValidationSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_APEX_VALIDATIONS', 'ONE_OR_MORE_APEX_VALIDATIONS']).nullable().default(null),
});

/**
 * Tests whether there is at least one APEX validation.
 */
export type RideAnalysisSimpleOneApexValidation = z.infer<typeof RideAnalysisSimpleOneApexValidationSchema>;

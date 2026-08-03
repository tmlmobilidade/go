/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisExpectedApexValidationIntervalSchema = RideAnalysisBaseSchema.extend({
	observed_average_interval: NonNegativeNumberSchema.nullable(),
	observed_max_interval: NonNegativeNumberSchema.nullable(),
	observed_min_interval: NonNegativeNumberSchema.nullable(),
	reason: z.enum(['NO_APEX_VALIDATIONS', 'NOT_ENOUGH_VALIDATIONS', 'INTERVALS_TOO_SHORT', 'NON_ORGANIC_INTERVALS', 'EXPECTED_VALIDATION_INTERVALS']).nullable(),
});

/**
 * Tests whether the average interval observed between APEX validations is within the expected range.
 * @param observed_average_interval The average interval observed between APEX validations, in seconds.
 * @param observed_max_interval The maximum interval observed between APEX validations, in seconds.
 * @param observed_min_interval The minimum interval observed between APEX validations, in seconds.
 */
export type RideAnalysisExpectedApexValidationInterval = z.infer<typeof RideAnalysisExpectedApexValidationIntervalSchema>;

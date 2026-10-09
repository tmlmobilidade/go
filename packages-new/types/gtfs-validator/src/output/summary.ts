/* * */

import { GtfsValidationOutputRuleMessageSchema } from '@/output/message.js';
import { z } from 'zod';

/* * */

export const GtfsValidationOutputSummarySchema = z.object({
	messages: z.array(GtfsValidationOutputRuleMessageSchema),
	total_errors: z.number(),
	total_warnings: z.number(),
});

export type GtfsValidationOutputSummary = z.infer<typeof GtfsValidationOutputSummarySchema>;

/* * */

import { GtfsValidationRuleMessageSchema } from '@/clean/message.js';
import { z } from 'zod';

/* * */

export const GtfsValidationSummarySchema = z.object({
	messages: z.array(GtfsValidationRuleMessageSchema),
	total_errors: z.number(),
	total_warnings: z.number(),
});

export type GtfsValidationSummary = z.infer<typeof GtfsValidationSummarySchema>;

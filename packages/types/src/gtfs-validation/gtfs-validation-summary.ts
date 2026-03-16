/* * */

import { GtfsValidationMessageSchema } from '@/gtfs-validation/gtfs-validation-message.js';
import { z } from 'zod';

/* * */

export const GtfsValidationSummarySchema = z.object({
	messages: z.array(GtfsValidationMessageSchema),
	total_errors: z.number(),
	total_warnings: z.number(),
});

export type GtfsValidationSummary = z.infer<typeof GtfsValidationSummarySchema>;

/* * */

import { PlanSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

/** Trip records in the plan's normalized GTFS, without calendar expansion. */
export const PlansDetailSummarySchema = z.object({
	status: z.enum(['ready', 'processing', 'error', 'unavailable']),
	trip_count: z.number().int().nonnegative().nullable(),
});

export const PlansDetailItemSchema = PlanSchema.extend({
	summary: PlansDetailSummarySchema,
});

export type PlansDetailSummary = z.infer<typeof PlansDetailSummarySchema>;
export type PlansDetailItem = z.infer<typeof PlansDetailItemSchema>;

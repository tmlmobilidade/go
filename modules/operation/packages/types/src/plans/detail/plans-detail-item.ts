/* * */

import { PlanSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

/** Full-plan scheduled totals; costs are in EUR at the current EUR/km rate. */
export const PlansDetailSummarySchema = z.object({
	cost_status: z.enum(['ready', 'missing_configuration', 'invalid_configuration', 'statistics_unavailable']),
	estimated_cost: z.number().finite().nonnegative().nullable(),
	kilometers: z.number().finite().nonnegative().nullable(),
	line_count: z.number().int().nonnegative().nullable(),
	price_per_km: z.number().finite().nonnegative().nullable(),
	status: z.enum(['ready', 'processing', 'error', 'unavailable']),
	trip_count: z.number().int().nonnegative().nullable(),
});

export const PlansDetailItemSchema = PlanSchema.extend({
	summary: PlansDetailSummarySchema,
});

export type PlansDetailSummary = z.infer<typeof PlansDetailSummarySchema>;
export type PlansDetailItem = z.infer<typeof PlansDetailItemSchema>;

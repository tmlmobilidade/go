/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/** Validates the calculation results stored in plan.apps.plans_statistics.statistics. */
export const PlanStatisticsSchema = z.object({
	line_count: z.number().int().nonnegative().safe(),
	plan_cost: z.union([
		z.object({ amount: z.number().finite().nonnegative(), status: z.literal('ready') }),
		z.object({ amount: z.null(), status: z.enum(['invalid_configuration', 'missing_configuration']) }),
	]),
	price_per_km: z.number().finite().nonnegative().nullable(),
	trip_count: z.number().int().nonnegative().safe(),
	vkm_count: z.number().finite().nonnegative(),
});

/** Processing metadata and results belonging to the plans-statistics worker. */
export const PlanAppStatisticsSchema = z.object({
	last_hash: z.string().nullable().default(null),
	message: z.string().nullable().default(null),
	statistics: PlanStatisticsSchema.nullable().default(null),
	status: ProcessingStatusSchema.default('waiting'),
	timestamp: UnixMillisecondsSchema.nullable().default(null),
});

export type PlanStatistics = z.infer<typeof PlanStatisticsSchema>;
export type PlanAppStatistics = z.infer<typeof PlanAppStatisticsSchema>;

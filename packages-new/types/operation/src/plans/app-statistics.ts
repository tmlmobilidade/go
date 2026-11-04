/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PlanStatisticsSchema } from './statistics.js';

/* * */

/** Invalidates cached totals calculated with the previous service-day semantics. */
export const PLAN_STATISTICS_VERSION = 1;

export const PlanAppStatisticsSchema = z.object({
	last_hash: z.string().nullable().default(null),
	message: z.string().nullable().default(null),
	statistics: PlanStatisticsSchema.nullable().default(null),
	status: ProcessingStatusSchema.default('waiting'),
	timestamp: UnixMillisecondsSchema.nullable().default(null),
	version: z.literal(PLAN_STATISTICS_VERSION).optional(),
});

export type PlanAppStatistics = z.infer<typeof PlanAppStatisticsSchema>;

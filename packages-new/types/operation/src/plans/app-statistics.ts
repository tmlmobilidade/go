/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PlanStatisticsSchema } from './statistics.js';

/* * */

export const PlanAppStatisticsSchema = z.object({
	last_hash: z.string().nullable().default(null),
	message: z.string().nullable().default(null),
	statistics: PlanStatisticsSchema.nullable().default(null),
	status: ProcessingStatusSchema.default('waiting'),
	timestamp: UnixMillisecondsSchema.nullable().default(null),
});

export type PlanAppStatistics = z.infer<typeof PlanAppStatisticsSchema>;

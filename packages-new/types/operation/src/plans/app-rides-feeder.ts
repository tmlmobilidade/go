/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PlanStatisticsSchema } from './statistics.js';

/* * */

export const PlanAppRidesFeederSchema = z.object({
	last_hash: z.string().nullable().default(null),
	message: z.string().nullable().default(null),
	statistics: PlanStatisticsSchema.nullable().optional(),
	status: ProcessingStatusSchema.default('waiting'),
	timestamp: UnixMillisecondsSchema.nullable().default(null),
}).default({});

export type PlanAppRidesFeeder = z.infer<typeof PlanAppRidesFeederSchema>;

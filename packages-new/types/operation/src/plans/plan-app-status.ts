/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlanAppStatusSchema = z.object({
	last_hash: z.string().nullable().default(null),
	status: ProcessingStatusSchema.default('waiting'),
	timestamp: UnixMillisecondsSchema.nullable().default(null),
});

/* * */

export type PlanAppStatus = z.infer<typeof PlanAppStatusSchema>;

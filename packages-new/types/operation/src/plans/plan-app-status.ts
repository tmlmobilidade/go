/* * */

import { ProcessingStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlanAppStatusSchema = z.object({
	last_hash: z.string().nullable().default(null),
	status: ProcessingStatusSchema.default('waiting'),
	timestamp: UnixTimestampSchema.nullable().default(null),
}).default({});

/* * */

export type PlanAppStatus = z.infer<typeof PlanAppStatusSchema>;

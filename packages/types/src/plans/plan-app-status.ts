/* * */

import { ProcessingStatusSchema } from '@/_common/status.js';
import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const PlanAppStatusSchema = z.object({
	last_hash: z.string().nullable().default(null),
	status: ProcessingStatusSchema.default('waiting'),
	timestamp: UnixTimeStampSchema.nullable().default(null),
}).default({});

/* * */

export type PlanAppStatus = z.infer<typeof PlanAppStatusSchema>;

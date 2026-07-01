/* * */

import { ProcessingStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlanPostersStatusSchema = z.object({
	file_id: z.string().nullable().optional(),
	job_id: z.string().nullable().optional(),
	last_hash: z.string().nullable().optional(),
	requested_by: z.string().email().nullable().optional(),
	status: ProcessingStatusSchema.default('skipped'),
	step: z.string().nullable().optional(),
	timestamp: UnixTimestampSchema.nullable().optional(),
}).default({});

export type PlanPostersStatus = z.infer<typeof PlanPostersStatusSchema>;

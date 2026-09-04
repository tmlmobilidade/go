/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlanAppHubPublishGtfsSchema = z.object({
	last_hash: z.string().nullable().default(null),
	message: z.string().nullable().default(null),
	metadata_hash: z.string().nullable().default(null),
	status: ProcessingStatusSchema.default('waiting'),
	timestamp: UnixMillisecondsSchema.nullable().default(null),
}).default({});

export type PlanAppHubPublishGtfs = z.infer<typeof PlanAppHubPublishGtfsSchema>;

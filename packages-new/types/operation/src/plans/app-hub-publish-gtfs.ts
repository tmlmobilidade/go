/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlanAppHubPublishGtfsSchema = z.object({
	message: z.string().nullable().default(null),
	status: ProcessingStatusSchema.default('waiting'),
	timestamp: UnixMillisecondsSchema.nullable().default(null),
}).default({});

export type PlanAppHubPublishGtfs = z.infer<typeof PlanAppHubPublishGtfsSchema>;

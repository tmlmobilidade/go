/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OrganizationOpenDataSchema = z.object({
	enabled: z.boolean().default(false),
	plans: z.object({
		hashes: z.array(z.string()).default([]),
		status: ProcessingStatusSchema.default('skipped'),
		timestamp: UnixMillisecondsSchema.nullable().default(null),
	}).prefault({}),
}).prefault({});

export type OrganizationOpenData = z.infer<typeof OrganizationOpenDataSchema>;

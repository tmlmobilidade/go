/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OrganizationOpenDataSchema = z.object({
	gtfs: z.object({
		enabled: z.boolean().default(false),
		plan_hashes: z.array(z.string()).default([]),
		status: ProcessingStatusSchema.default('skipped'),
		timestamp: UnixMillisecondsSchema.nullable().default(null),
	}).default({ enabled: false, plan_hashes: [], status: 'skipped', timestamp: null }),
}).default({});

export type OrganizationOpenData = z.infer<typeof OrganizationOpenDataSchema>;

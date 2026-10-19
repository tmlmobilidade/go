/* * */

import { ProcessingStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OrganizationOpenDataSchema = z.object({
	plans: z.object({
		enabled: z.boolean().default(false),
		hashes: z.array(z.string()).default([]),
		status: ProcessingStatusSchema.default('skipped'),
		timestamp: UnixMillisecondsSchema.nullable().default(null),
	}).default({ enabled: false, hashes: [], status: 'skipped', timestamp: null }),
	realtime: z.object({
		alerts: z.boolean().default(false),
		eta: z.boolean().default(false),
	}).default({ alerts: false, eta: false }),
}).default({});

export type OrganizationOpenData = z.infer<typeof OrganizationOpenDataSchema>;

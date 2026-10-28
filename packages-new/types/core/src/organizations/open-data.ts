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
	}).default({ hashes: [], status: 'skipped', timestamp: null }),
}).default({ enabled: false, plans: { hashes: [], status: 'skipped', timestamp: null } });

export type OrganizationOpenData = z.infer<typeof OrganizationOpenDataSchema>;

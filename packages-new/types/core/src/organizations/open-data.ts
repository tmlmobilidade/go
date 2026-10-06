/* * */

import { ProcessingStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OrganizationOpenDataSchema = z.object({
	gtfs_status: ProcessingStatusSchema.default('waiting'),
	services: z.object({
		gtfs_enabled: z.boolean().default(false),
	}).default({}),
}).default({});

export type OrganizationOpenData = z.infer<typeof OrganizationOpenDataSchema>;

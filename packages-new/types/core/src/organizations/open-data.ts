/* * */

import { z } from 'zod';

/* * */

export const OrganizationOpenDataSchema = z.object({
	services: z.object({
		gtfs_enabled: z.boolean().default(false),
	}).default({}),
}).default({});

export type OrganizationOpenData = z.infer<typeof OrganizationOpenDataSchema>;

/* * */

import { z } from 'zod';

/* * */

export const LinesPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
}).default({});

export type LinesPermissionResources = z.infer<typeof LinesPermissionResourcesSchema>;

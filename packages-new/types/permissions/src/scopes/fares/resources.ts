/* * */

import { z } from 'zod';

/* * */

export const FaresPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
}).default({});

export type FaresPermissionResources = z.infer<typeof FaresPermissionResourcesSchema>;

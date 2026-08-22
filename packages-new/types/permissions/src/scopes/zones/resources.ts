/* * */

import { z } from 'zod';

/* * */

export const ZonesPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
}).default({});

export type ZonesPermissionResources = z.infer<typeof ZonesPermissionResourcesSchema>;

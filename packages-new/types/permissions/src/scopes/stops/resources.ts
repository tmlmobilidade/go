/* * */

import { z } from 'zod';

/* * */

export const StopsPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
	municipality_ids: z.array(z.string()).default([]),
});

export type StopsPermissionResources = z.infer<typeof StopsPermissionResourcesSchema>;

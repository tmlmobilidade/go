/* * */

import { z } from 'zod';

/* * */

export const PlansPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type PlansPermissionResources = z.infer<typeof PlansPermissionResourcesSchema>;

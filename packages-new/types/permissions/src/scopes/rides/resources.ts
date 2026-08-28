/* * */

import { z } from 'zod';

/* * */

export const RidesPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type RidesPermissionResources = z.infer<typeof RidesPermissionResourcesSchema>;

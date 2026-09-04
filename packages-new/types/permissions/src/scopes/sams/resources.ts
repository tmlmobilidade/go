/* * */

import { z } from 'zod';

/* * */

export const SamsPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type SamsPermissionResources = z.infer<typeof SamsPermissionResourcesSchema>;

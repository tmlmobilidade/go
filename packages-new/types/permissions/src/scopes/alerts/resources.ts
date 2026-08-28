/* * */

import { z } from 'zod';

/* * */

export const AlertsPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
	reference_types: z.array(z.string()).default([]),
});

export type AlertsPermissionResources = z.infer<typeof AlertsPermissionResourcesSchema>;

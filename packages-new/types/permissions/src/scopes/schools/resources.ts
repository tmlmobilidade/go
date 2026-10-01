/* * */

import { z } from 'zod';

/* * */

export const SchoolsPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type SchoolsPermissionResources = z.infer<typeof SchoolsPermissionResourcesSchema>;

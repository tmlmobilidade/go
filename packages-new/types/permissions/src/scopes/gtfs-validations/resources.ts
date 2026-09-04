/* * */

import { z } from 'zod';

/* * */

export const GtfsValidationsPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type GtfsValidationsPermissionResources = z.infer<typeof GtfsValidationsPermissionResourcesSchema>;

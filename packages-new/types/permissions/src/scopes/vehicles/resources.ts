/* * */

import { z } from 'zod';

/* * */

export const VehiclesPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
}).default({});

export type VehiclesPermissionResources = z.infer<typeof VehiclesPermissionResourcesSchema>;

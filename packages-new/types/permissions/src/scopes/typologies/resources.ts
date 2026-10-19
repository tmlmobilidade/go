/* * */

import { z } from 'zod';

/* * */

export const TypologiesPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type TypologiesPermissionResources = z.infer<typeof TypologiesPermissionResourcesSchema>;

/* * */

import { z } from 'zod';

/* * */

export const HolidaysPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type HolidaysPermissionResources = z.infer<typeof HolidaysPermissionResourcesSchema>;

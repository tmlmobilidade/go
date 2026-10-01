/* * */

import { z } from 'zod';

/* * */

export const YearPeriodsPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type YearPeriodsPermissionResources = z.infer<typeof YearPeriodsPermissionResourcesSchema>;

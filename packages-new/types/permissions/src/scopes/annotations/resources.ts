/* * */

import { z } from 'zod';

/* * */

export const AnnotationsPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type AnnotationsPermissionResources = z.infer<typeof AnnotationsPermissionResourcesSchema>;

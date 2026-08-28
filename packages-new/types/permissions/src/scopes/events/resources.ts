/* * */

import { z } from 'zod';

/* * */

export const EventsPermissionResourcesSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
});

export type EventsPermissionResources = z.infer<typeof EventsPermissionResourcesSchema>;

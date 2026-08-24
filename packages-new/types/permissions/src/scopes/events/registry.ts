/* * */

import { z } from 'zod';

import { EventsPermissionActionsSchema } from './actions.js';
import { EventsPermissionScopeSchema } from './scope.js';

/* * */

export const EventsPermissionRegistrySchema = z.object({
	actions: z.array(EventsPermissionActionsSchema),
	scope: EventsPermissionScopeSchema,
});

export type EventsPermissionRegistry = z.infer<typeof EventsPermissionRegistrySchema>;

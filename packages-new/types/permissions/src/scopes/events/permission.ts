/* * */

import { z } from 'zod';

import { EventsPermissionActionsSchema } from './actions.js';
import { EventsPermissionResourcesSchema } from './resources.js';
import { EventsPermissionScopeSchema } from './scope.js';

/* * */

export const EventsPermissionSchema = z.object({
	action: EventsPermissionActionsSchema,
	resources: EventsPermissionResourcesSchema.default({}),
	scope: EventsPermissionScopeSchema,
});

export type EventsPermission = z.infer<typeof EventsPermissionSchema>;

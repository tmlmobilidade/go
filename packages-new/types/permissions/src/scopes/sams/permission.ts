/* * */

import { z } from 'zod';

import { SamsPermissionActionsSchema } from './actions.js';
import { SamsPermissionResourcesSchema } from './resources.js';
import { SamsPermissionScopeSchema } from './scope.js';

/* * */

export const SamsPermissionSchema = z.object({
	action: SamsPermissionActionsSchema,
	resources: SamsPermissionResourcesSchema,
	scope: SamsPermissionScopeSchema,
});

export type SamsPermission = z.infer<typeof SamsPermissionSchema>;

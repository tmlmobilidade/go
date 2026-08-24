/* * */

import { z } from 'zod';

import { StopsPermissionActionsSchema } from './actions.js';
import { StopsPermissionResourcesSchema } from './resources.js';
import { StopsPermissionScopeSchema } from './scope.js';

/* * */

export const StopsPermissionSchema = z.object({
	action: StopsPermissionActionsSchema,
	resources: StopsPermissionResourcesSchema.default({}),
	scope: StopsPermissionScopeSchema,
});

export type StopsPermission = z.infer<typeof StopsPermissionSchema>;

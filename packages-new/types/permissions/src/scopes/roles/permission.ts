/* * */

import { z } from 'zod';

import { RolesPermissionActionsSchema } from './actions.js';
import { RolesPermissionScopeSchema } from './scope.js';

/* * */

export const RolesPermissionSchema = z.object({
	action: RolesPermissionActionsSchema,
	scope: RolesPermissionScopeSchema,
});

export type RolesPermission = z.infer<typeof RolesPermissionSchema>;

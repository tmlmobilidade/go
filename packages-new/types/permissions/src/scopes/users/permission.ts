/* * */

import { z } from 'zod';

import { UsersPermissionActionsSchema } from './actions.js';
import { UsersPermissionScopeSchema } from './scope.js';

/* * */

export const UsersPermissionSchema = z.object({
	action: UsersPermissionActionsSchema,
	scope: UsersPermissionScopeSchema,
});

export type UsersPermission = z.infer<typeof UsersPermissionSchema>;

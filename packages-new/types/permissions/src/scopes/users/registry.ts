/* * */

import { z } from 'zod';

import { UsersPermissionActionsSchema } from './actions.js';
import { UsersPermissionScopeSchema } from './scope.js';

/* * */

export const UsersPermissionRegistrySchema = z.object({
	actions: z.array(UsersPermissionActionsSchema),
	scope: UsersPermissionScopeSchema,
});

export type UsersPermissionRegistry = z.infer<typeof UsersPermissionRegistrySchema>;

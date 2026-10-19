/* * */

import { z } from 'zod';

import { RolesPermissionActionsSchema } from './actions.js';
import { RolesPermissionScopeSchema } from './scope.js';

/* * */

export const RolesPermissionRegistrySchema = z.object({
	actions: z.array(RolesPermissionActionsSchema),
	scope: RolesPermissionScopeSchema,
});

export type RolesPermissionRegistry = z.infer<typeof RolesPermissionRegistrySchema>;

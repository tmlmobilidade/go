/* * */

import { z } from 'zod';

import { HomePermissionActionsSchema } from './actions.js';
import { HomePermissionScopeSchema } from './scope.js';

/* * */

export const HomePermissionRegistrySchema = z.object({
	actions: z.array(HomePermissionActionsSchema),
	scope: HomePermissionScopeSchema,
});

export type HomePermissionRegistry = z.infer<typeof HomePermissionRegistrySchema>;

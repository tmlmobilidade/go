/* * */

import { z } from 'zod';

import { StopsPermissionActionsSchema } from './actions.js';
import { StopsPermissionScopeSchema } from './scope.js';

/* * */

export const StopsPermissionRegistrySchema = z.object({
	actions: z.array(StopsPermissionActionsSchema),
	scope: StopsPermissionScopeSchema,
});

export type StopsPermissionRegistry = z.infer<typeof StopsPermissionRegistrySchema>;

/* * */

import { z } from 'zod';

import { PlansPermissionActionsSchema } from './actions.js';
import { PlansPermissionScopeSchema } from './scope.js';

/* * */

export const PlansPermissionRegistrySchema = z.object({
	actions: z.array(PlansPermissionActionsSchema),
	scope: PlansPermissionScopeSchema,
});

export type PlansPermissionRegistry = z.infer<typeof PlansPermissionRegistrySchema>;

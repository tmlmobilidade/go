/* * */

import { z } from 'zod';

import { AgenciesPermissionActionsSchema } from './actions.js';
import { AgenciesPermissionScopeSchema } from './scope.js';

/* * */

export const AgenciesPermissionRegistrySchema = z.object({
	actions: z.array(AgenciesPermissionActionsSchema),
	scope: AgenciesPermissionScopeSchema,
});

export type AgenciesPermissionRegistry = z.infer<typeof AgenciesPermissionRegistrySchema>;

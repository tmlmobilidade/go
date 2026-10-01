/* * */

import { z } from 'zod';

import { SamsPermissionActionsSchema } from './actions.js';
import { SamsPermissionScopeSchema } from './scope.js';

/* * */

export const SamsPermissionRegistrySchema = z.object({
	actions: z.array(SamsPermissionActionsSchema),
	scope: SamsPermissionScopeSchema,
});

export type SamsPermissionRegistry = z.infer<typeof SamsPermissionRegistrySchema>;

/* * */

import { z } from 'zod';

import { TypologiesPermissionActionsSchema } from './actions.js';
import { TypologiesPermissionScopeSchema } from './scope.js';

/* * */

export const TypologiesPermissionRegistrySchema = z.object({
	actions: z.array(TypologiesPermissionActionsSchema),
	scope: TypologiesPermissionScopeSchema,
});

export type TypologiesPermissionRegistry = z.infer<typeof TypologiesPermissionRegistrySchema>;

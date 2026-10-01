/* * */

import { z } from 'zod';

import { FaresPermissionActionsSchema } from './actions.js';
import { FaresPermissionScopeSchema } from './scope.js';

/* * */

export const FaresPermissionRegistrySchema = z.object({
	actions: z.array(FaresPermissionActionsSchema),
	scope: FaresPermissionScopeSchema,
});

export type FaresPermissionRegistry = z.infer<typeof FaresPermissionRegistrySchema>;

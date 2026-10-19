/* * */

import { z } from 'zod';

import { PerformancePermissionActionsSchema } from './actions.js';
import { PerformancePermissionScopeSchema } from './scope.js';

/* * */

export const PerformancePermissionRegistrySchema = z.object({
	actions: z.array(PerformancePermissionActionsSchema),
	scope: PerformancePermissionScopeSchema,
});

export type PerformancePermissionRegistry = z.infer<typeof PerformancePermissionRegistrySchema>;

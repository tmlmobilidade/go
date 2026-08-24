/* * */

import { z } from 'zod';

import { VehiclesPermissionActionsSchema } from './actions.js';
import { VehiclesPermissionScopeSchema } from './scope.js';

/* * */

export const VehiclesPermissionRegistrySchema = z.object({
	actions: z.array(VehiclesPermissionActionsSchema),
	scope: VehiclesPermissionScopeSchema,
});

export type VehiclesPermissionRegistry = z.infer<typeof VehiclesPermissionRegistrySchema>;

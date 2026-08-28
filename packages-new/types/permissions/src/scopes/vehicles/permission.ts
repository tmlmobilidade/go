/* * */

import { z } from 'zod';

import { VehiclesPermissionActionsSchema } from './actions.js';
import { VehiclesPermissionResourcesSchema } from './resources.js';
import { VehiclesPermissionScopeSchema } from './scope.js';

/* * */

export const VehiclesPermissionSchema = z.object({
	action: VehiclesPermissionActionsSchema,
	resources: VehiclesPermissionResourcesSchema.default({}),
	scope: VehiclesPermissionScopeSchema,
});

export type VehiclesPermission = z.infer<typeof VehiclesPermissionSchema>;

/* * */

import { z } from 'zod';

import { RidesPermissionActionsSchema } from './actions.js';
import { RidesPermissionScopeSchema } from './scope.js';

/* * */

export const RidesPermissionRegistrySchema = z.object({
	actions: z.array(RidesPermissionActionsSchema),
	scope: RidesPermissionScopeSchema,
});

export type RidesPermissionRegistry = z.infer<typeof RidesPermissionRegistrySchema>;

/* * */

import { z } from 'zod';

import { ZonesPermissionActionsSchema } from './actions.js';
import { ZonesPermissionScopeSchema } from './scope.js';

/* * */

export const ZonesPermissionRegistrySchema = z.object({
	actions: z.array(ZonesPermissionActionsSchema),
	scope: ZonesPermissionScopeSchema,
});

export type ZonesPermissionRegistry = z.infer<typeof ZonesPermissionRegistrySchema>;

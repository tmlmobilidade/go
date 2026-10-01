/* * */

import { z } from 'zod';

import { GtfsValidationsPermissionActionsSchema } from './actions.js';
import { GtfsValidationsPermissionScopeSchema } from './scope.js';

/* * */

export const GtfsValidationsPermissionRegistrySchema = z.object({
	actions: z.array(GtfsValidationsPermissionActionsSchema),
	scope: GtfsValidationsPermissionScopeSchema,
});

export type GtfsValidationsPermissionRegistry = z.infer<typeof GtfsValidationsPermissionRegistrySchema>;

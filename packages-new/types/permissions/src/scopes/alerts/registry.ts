/* * */

import { z } from 'zod';

import { AlertsPermissionActionsSchema } from './actions.js';
import { AlertsPermissionScopeSchema } from './scope.js';

/* * */

export const AlertsPermissionRegistrySchema = z.object({
	actions: z.array(AlertsPermissionActionsSchema),
	scope: AlertsPermissionScopeSchema,
});

export type AlertsPermissionRegistry = z.infer<typeof AlertsPermissionRegistrySchema>;

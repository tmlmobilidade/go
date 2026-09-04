/* * */

import { z } from 'zod';

import { AlertsPermissionActionsSchema } from './actions.js';
import { AlertsPermissionResourcesSchema } from './resources.js';
import { AlertsPermissionScopeSchema } from './scope.js';

/* * */

export const AlertsPermissionSchema = z.object({
	action: AlertsPermissionActionsSchema,
	resources: AlertsPermissionResourcesSchema.default({ agency_ids: [], reference_types: [] }),
	scope: AlertsPermissionScopeSchema,
});

export type AlertsPermission = z.infer<typeof AlertsPermissionSchema>;

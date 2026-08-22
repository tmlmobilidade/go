/* * */

import { z } from 'zod';

import { ZonesPermissionActionsSchema } from './actions.js';
import { ZonesPermissionResourcesSchema } from './resources.js';
import { ZonesPermissionScopeSchema } from './scope.js';

/* * */

export const ZonesPermissionSchema = z.object({
	action: ZonesPermissionActionsSchema,
	resources: ZonesPermissionResourcesSchema,
	scope: ZonesPermissionScopeSchema,
});

export type ZonesPermission = z.infer<typeof ZonesPermissionSchema>;

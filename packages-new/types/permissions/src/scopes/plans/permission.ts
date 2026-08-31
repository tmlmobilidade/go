/* * */

import { z } from 'zod';

import { PlansPermissionActionsSchema } from './actions.js';
import { PlansPermissionResourcesSchema } from './resources.js';
import { PlansPermissionScopeSchema } from './scope.js';

/* * */

export const PlansPermissionSchema = z.object({
	action: PlansPermissionActionsSchema,
	resources: PlansPermissionResourcesSchema.default({ agency_ids: [] }),
	scope: PlansPermissionScopeSchema,
});

export type PlansPermission = z.infer<typeof PlansPermissionSchema>;

/* * */

import { z } from 'zod';

import { GtfsValidationsPermissionActionsSchema } from './actions.js';
import { GtfsValidationsPermissionResourcesSchema } from './resources.js';
import { GtfsValidationsPermissionScopeSchema } from './scope.js';

/* * */

export const GtfsValidationsPermissionSchema = z.object({
	action: GtfsValidationsPermissionActionsSchema,
	resources: GtfsValidationsPermissionResourcesSchema.default({ agency_ids: [] }),
	scope: GtfsValidationsPermissionScopeSchema,
});

export type GtfsValidationsPermission = z.infer<typeof GtfsValidationsPermissionSchema>;

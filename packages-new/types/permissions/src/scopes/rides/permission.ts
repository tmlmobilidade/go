/* * */

import { z } from 'zod';

import { RidesPermissionActionsSchema } from './actions.js';
import { RidesPermissionResourcesSchema } from './resources.js';
import { RidesPermissionScopeSchema } from './scope.js';

/* * */

export const RidesPermissionSchema = z.object({
	action: RidesPermissionActionsSchema,
	resources: RidesPermissionResourcesSchema.default({}),
	scope: RidesPermissionScopeSchema,
});

export type RidesPermission = z.infer<typeof RidesPermissionSchema>;

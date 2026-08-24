/* * */

import { z } from 'zod';

import { FaresPermissionActionsSchema } from './actions.js';
import { FaresPermissionResourcesSchema } from './resources.js';
import { FaresPermissionScopeSchema } from './scope.js';

/* * */

export const FaresPermissionSchema = z.object({
	action: FaresPermissionActionsSchema,
	resources: FaresPermissionResourcesSchema.default({}),
	scope: FaresPermissionScopeSchema,
});

export type FaresPermission = z.infer<typeof FaresPermissionSchema>;

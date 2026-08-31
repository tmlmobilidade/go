/* * */

import { z } from 'zod';

import { SchoolsPermissionActionsSchema } from './actions.js';
import { SchoolsPermissionResourcesSchema } from './resources.js';
import { SchoolsPermissionScopeSchema } from './scope.js';

/* * */

export const SchoolsPermissionSchema = z.object({
	action: SchoolsPermissionActionsSchema,
	resources: SchoolsPermissionResourcesSchema.default({}),
	scope: SchoolsPermissionScopeSchema,
});

export type SchoolsPermission = z.infer<typeof SchoolsPermissionSchema>;

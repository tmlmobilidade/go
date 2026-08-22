/* * */

import { z } from 'zod';

import { TypologiesPermissionActionsSchema } from './actions.js';
import { TypologiesPermissionResourcesSchema } from './resources.js';
import { TypologiesPermissionScopeSchema } from './scope.js';

/* * */

export const TypologiesPermissionSchema = z.object({
	action: TypologiesPermissionActionsSchema,
	resources: TypologiesPermissionResourcesSchema,
	scope: TypologiesPermissionScopeSchema,
});

export type TypologiesPermission = z.infer<typeof TypologiesPermissionSchema>;

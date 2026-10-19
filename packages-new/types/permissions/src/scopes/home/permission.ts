/* * */

import { z } from 'zod';

import { HomePermissionActionsSchema } from './actions.js';
import { HomePermissionScopeSchema } from './scope.js';

/* * */

export const HomePermissionSchema = z.object({
	action: HomePermissionActionsSchema,
	scope: HomePermissionScopeSchema,
});

export type HomePermission = z.infer<typeof HomePermissionSchema>;

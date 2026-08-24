/* * */

import { z } from 'zod';

import { LinesPermissionActionsSchema } from './actions.js';
import { LinesPermissionResourcesSchema } from './resources.js';
import { LinesPermissionScopeSchema } from './scope.js';

/* * */

export const LinesPermissionSchema = z.object({
	action: LinesPermissionActionsSchema,
	resources: LinesPermissionResourcesSchema.default({}),
	scope: LinesPermissionScopeSchema,
});

export type LinesPermission = z.infer<typeof LinesPermissionSchema>;

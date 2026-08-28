/* * */

import { z } from 'zod';

import { HolidaysPermissionActionsSchema } from './actions.js';
import { HolidaysPermissionResourcesSchema } from './resources.js';
import { HolidaysPermissionScopeSchema } from './scope.js';

/* * */

export const HolidaysPermissionSchema = z.object({
	action: HolidaysPermissionActionsSchema,
	resources: HolidaysPermissionResourcesSchema.default({}),
	scope: HolidaysPermissionScopeSchema,
});

export type HolidaysPermission = z.infer<typeof HolidaysPermissionSchema>;

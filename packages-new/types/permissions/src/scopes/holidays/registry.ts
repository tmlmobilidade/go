/* * */

import { z } from 'zod';

import { HolidaysPermissionActionsSchema } from './actions.js';
import { HolidaysPermissionScopeSchema } from './scope.js';

/* * */

export const HolidaysPermissionRegistrySchema = z.object({
	actions: z.array(HolidaysPermissionActionsSchema),
	scope: HolidaysPermissionScopeSchema,
});

export type HolidaysPermissionRegistry = z.infer<typeof HolidaysPermissionRegistrySchema>;

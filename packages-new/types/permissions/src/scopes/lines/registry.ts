/* * */

import { z } from 'zod';

import { LinesPermissionActionsSchema } from './actions.js';
import { LinesPermissionScopeSchema } from './scope.js';

/* * */

export const LinesPermissionRegistrySchema = z.object({
	actions: z.array(LinesPermissionActionsSchema),
	scope: LinesPermissionScopeSchema,
});

export type LinesPermissionRegistry = z.infer<typeof LinesPermissionRegistrySchema>;

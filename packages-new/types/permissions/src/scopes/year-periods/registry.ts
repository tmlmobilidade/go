/* * */

import { z } from 'zod';

import { YearPeriodsPermissionActionsSchema } from './actions.js';
import { YearPeriodsPermissionScopeSchema } from './scope.js';

/* * */

export const YearPeriodsPermissionRegistrySchema = z.object({
	actions: z.array(YearPeriodsPermissionActionsSchema),
	scope: YearPeriodsPermissionScopeSchema,
});

export type YearPeriodsPermissionRegistry = z.infer<typeof YearPeriodsPermissionRegistrySchema>;

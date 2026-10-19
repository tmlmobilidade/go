/* * */

import { z } from 'zod';

import { SchoolsPermissionActionsSchema } from './actions.js';
import { SchoolsPermissionScopeSchema } from './scope.js';

/* * */

export const SchoolsPermissionRegistrySchema = z.object({
	actions: z.array(SchoolsPermissionActionsSchema),
	scope: SchoolsPermissionScopeSchema,
});

export type SchoolsPermissionRegistry = z.infer<typeof SchoolsPermissionRegistrySchema>;

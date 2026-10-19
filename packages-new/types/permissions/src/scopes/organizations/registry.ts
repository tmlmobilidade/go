/* * */

import { z } from 'zod';

import { OrganizationsPermissionActionsSchema } from './actions.js';
import { OrganizationsPermissionScopeSchema } from './scope.js';

/* * */

export const OrganizationsPermissionRegistrySchema = z.object({
	actions: z.array(OrganizationsPermissionActionsSchema),
	scope: OrganizationsPermissionScopeSchema,
});

export type OrganizationsPermissionRegistry = z.infer<typeof OrganizationsPermissionRegistrySchema>;

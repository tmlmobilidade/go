/* * */

import { z } from 'zod';

import { OrganizationsPermissionActionsSchema } from './actions.js';
import { OrganizationsPermissionScopeSchema } from './scope.js';

/* * */

export const OrganizationsPermissionSchema = z.object({
	action: OrganizationsPermissionActionsSchema,
	scope: OrganizationsPermissionScopeSchema,
});

export type OrganizationsPermission = z.infer<typeof OrganizationsPermissionSchema>;

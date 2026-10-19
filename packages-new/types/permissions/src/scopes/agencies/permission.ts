/* * */

import { z } from 'zod';

import { AgenciesPermissionActionsSchema } from './actions.js';
import { AgenciesPermissionScopeSchema } from './scope.js';

/* * */

export const AgenciesPermissionSchema = z.object({
	action: AgenciesPermissionActionsSchema,
	scope: AgenciesPermissionScopeSchema,
});

export type AgenciesPermission = z.infer<typeof AgenciesPermissionSchema>;

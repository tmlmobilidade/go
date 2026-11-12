import { z } from 'zod';

import { ChangelogsPermissionActionsSchema } from './actions.js';
import { ChangelogsPermissionScopeSchema } from './scope.js';

export const ChangelogsPermissionSchema = z.object({
	action: ChangelogsPermissionActionsSchema,
	scope: ChangelogsPermissionScopeSchema,
});
export type ChangelogsPermission = z.infer<typeof ChangelogsPermissionSchema>;

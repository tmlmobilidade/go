import { z } from 'zod';

import { ChangelogsPermissionActionsSchema } from './actions.js';
import { ChangelogsPermissionScopeSchema } from './scope.js';

export const ChangelogsPermissionRegistrySchema = z.object({
	actions: z.array(ChangelogsPermissionActionsSchema),
	scope: ChangelogsPermissionScopeSchema,
});
export type ChangelogsPermissionRegistry = z.infer<typeof ChangelogsPermissionRegistrySchema>;

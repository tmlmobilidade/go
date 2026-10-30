import { z } from 'zod';

import { BannersPermissionActionsSchema } from './actions.js';
import { BannersPermissionScopeSchema } from './scope.js';

export const BannersPermissionRegistrySchema = z.object({
	actions: z.array(BannersPermissionActionsSchema),
	scope: BannersPermissionScopeSchema,
});
export type BannersPermissionRegistry = z.infer<typeof BannersPermissionRegistrySchema>;

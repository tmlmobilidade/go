import { z } from 'zod';

import { BannersPermissionActionsSchema } from './actions.js';
import { BannersPermissionScopeSchema } from './scope.js';

export const BannersPermissionSchema = z.object({
	action: BannersPermissionActionsSchema,
	scope: BannersPermissionScopeSchema,
});
export type BannersPermission = z.infer<typeof BannersPermissionSchema>;

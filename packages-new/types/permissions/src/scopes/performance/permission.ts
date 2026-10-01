/* * */

import { z } from 'zod';

import { PerformancePermissionActionsSchema } from './actions.js';
import { PerformancePermissionScopeSchema } from './scope.js';

/* * */

export const PerformancePermissionSchema = z.object({
	action: PerformancePermissionActionsSchema,
	scope: PerformancePermissionScopeSchema,
});

export type PerformancePermission = z.infer<typeof PerformancePermissionSchema>;

/* * */

import { z } from 'zod';

import { YearPeriodsPermissionActionsSchema } from './actions.js';
import { YearPeriodsPermissionResourcesSchema } from './resources.js';
import { YearPeriodsPermissionScopeSchema } from './scope.js';

/* * */

export const YearPeriodsPermissionSchema = z.object({
	action: YearPeriodsPermissionActionsSchema,
	resources: YearPeriodsPermissionResourcesSchema.default({ agency_ids: [] }),
	scope: YearPeriodsPermissionScopeSchema,
});

export type YearPeriodsPermission = z.infer<typeof YearPeriodsPermissionSchema>;

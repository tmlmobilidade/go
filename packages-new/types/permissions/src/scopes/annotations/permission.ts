/* * */

import { z } from 'zod';

import { AnnotationsPermissionActionsSchema } from './actions.js';
import { AnnotationsPermissionResourcesSchema } from './resources.js';
import { AnnotationsPermissionScopeSchema } from './scope.js';

/* * */

export const AnnotationsPermissionSchema = z.object({
	action: AnnotationsPermissionActionsSchema,
	resources: AnnotationsPermissionResourcesSchema,
	scope: AnnotationsPermissionScopeSchema,
});

export type AnnotationsPermission = z.infer<typeof AnnotationsPermissionSchema>;

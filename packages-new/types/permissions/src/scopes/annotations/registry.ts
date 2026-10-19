/* * */

import { z } from 'zod';

import { AnnotationsPermissionActionsSchema } from './actions.js';
import { AnnotationsPermissionScopeSchema } from './scope.js';

/* * */

export const AnnotationsPermissionRegistrySchema = z.object({
	actions: z.array(AnnotationsPermissionActionsSchema),
	scope: AnnotationsPermissionScopeSchema,
});

export type AnnotationsPermissionRegistry = z.infer<typeof AnnotationsPermissionRegistrySchema>;

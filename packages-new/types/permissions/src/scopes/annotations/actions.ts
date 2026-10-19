/* * */

import { z } from 'zod';

/* * */

const AnnotationsPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const AnnotationsPermissionActionsSchema = z.enum(AnnotationsPermissionActionsValues);

export type AnnotationsPermissionActions = z.infer<typeof AnnotationsPermissionActionsSchema>;

/* * */

import { z } from 'zod';

/* * */

const SchoolsPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const SchoolsPermissionActionsSchema = z.enum(SchoolsPermissionActionsValues);

export type SchoolsPermissionActions = z.infer<typeof SchoolsPermissionActionsSchema>;

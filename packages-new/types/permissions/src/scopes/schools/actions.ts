/* * */

import { z } from 'zod';

/* * */

const SchoolsPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
	'update_publish_status',
] as const;

export const SchoolsPermissionActionsSchema = z.enum(SchoolsPermissionActionsValues);

export type SchoolsPermissionActions = z.infer<typeof SchoolsPermissionActionsSchema>;

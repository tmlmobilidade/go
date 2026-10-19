/* * */

import { z } from 'zod';

/* * */

const RolesPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const RolesPermissionActionsSchema = z.enum(RolesPermissionActionsValues);

export type RolesPermissionActions = z.infer<typeof RolesPermissionActionsSchema>;

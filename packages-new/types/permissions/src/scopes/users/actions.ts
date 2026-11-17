/* * */

import { z } from 'zod';

/* * */

const UsersPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const UsersPermissionActionsSchema = z.enum(UsersPermissionActionsValues);

export type UsersPermissionActions = z.infer<typeof UsersPermissionActionsSchema>;

/* * */

import { z } from 'zod';

/* * */

const UsersPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'manage_session_replay',
	'update',
] as const;

export const UsersPermissionActionsSchema = z.enum(UsersPermissionActionsValues);

export type UsersPermissionActions = z.infer<typeof UsersPermissionActionsSchema>;

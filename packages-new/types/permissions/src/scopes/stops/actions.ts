/* * */

import { z } from 'zod';

/* * */

const StopsPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
	'export',
	'edit_coordinates',
	'edit_name',
] as const;

export const StopsPermissionActionsSchema = z.enum(StopsPermissionActionsValues);

export type StopsPermissionActions = z.infer<typeof StopsPermissionActionsSchema>;

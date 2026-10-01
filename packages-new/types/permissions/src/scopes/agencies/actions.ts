/* * */

import { z } from 'zod';

/* * */

const AgenciesPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const AgenciesPermissionActionsSchema = z.enum(AgenciesPermissionActionsValues);

export type AgenciesPermissionActions = z.infer<typeof AgenciesPermissionActionsSchema>;

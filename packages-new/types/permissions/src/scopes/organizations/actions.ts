/* * */

import { z } from 'zod';

/* * */

const OrganizationsPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const OrganizationsPermissionActionsSchema = z.enum(OrganizationsPermissionActionsValues);

export type OrganizationsPermissionActions = z.infer<typeof OrganizationsPermissionActionsSchema>;

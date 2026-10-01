/* * */

import { z } from 'zod';

/* * */

const ZonesPermissionActionsValues = [
	'create',
	'delete',
	'lock',
	'nav',
	'update',
] as const;

export const ZonesPermissionActionsSchema = z.enum(ZonesPermissionActionsValues);

export type ZonesPermissionActions = z.infer<typeof ZonesPermissionActionsSchema>;

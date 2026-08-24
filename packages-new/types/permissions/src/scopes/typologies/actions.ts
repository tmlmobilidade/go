/* * */

import { z } from 'zod';

/* * */

const TypologiesPermissionActionsValues = [
	'create',
	'delete',
	'lock',
	'nav',
	'update',
] as const;

export const TypologiesPermissionActionsSchema = z.enum(TypologiesPermissionActionsValues);

export type TypologiesPermissionActions = z.infer<typeof TypologiesPermissionActionsSchema>;

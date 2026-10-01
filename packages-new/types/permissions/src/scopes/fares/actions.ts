/* * */

import { z } from 'zod';

/* * */

const FaresPermissionActionsValues = [
	'create',
	'delete',
	'lock',
	'nav',
	'update',
] as const;

export const FaresPermissionActionsSchema = z.enum(FaresPermissionActionsValues);

export type FaresPermissionActions = z.infer<typeof FaresPermissionActionsSchema>;

/* * */

import { z } from 'zod';

/* * */

const YearPeriodsPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const YearPeriodsPermissionActionsSchema = z.enum(YearPeriodsPermissionActionsValues);

export type YearPeriodsPermissionActions = z.infer<typeof YearPeriodsPermissionActionsSchema>;

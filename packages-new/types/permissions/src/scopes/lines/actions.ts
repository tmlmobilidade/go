/* * */

import { z } from 'zod';

/* * */

const LinesPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const LinesPermissionActionsSchema = z.enum(LinesPermissionActionsValues);

export type LinesPermissionActions = z.infer<typeof LinesPermissionActionsSchema>;

/* * */

import { z } from 'zod';

/* * */

const LinesPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
	'extract-stepp',
] as const;

export const LinesPermissionActionsSchema = z.enum(LinesPermissionActionsValues);

export type LinesPermissionActions = z.infer<typeof LinesPermissionActionsSchema>;

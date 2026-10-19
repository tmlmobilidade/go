/* * */

import { z } from 'zod';

/* * */

const HolidaysPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const HolidaysPermissionActionsSchema = z.enum(HolidaysPermissionActionsValues);

export type HolidaysPermissionActions = z.infer<typeof HolidaysPermissionActionsSchema>;

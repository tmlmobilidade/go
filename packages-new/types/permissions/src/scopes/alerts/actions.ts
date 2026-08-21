/* * */

import { z } from 'zod';

/* * */

const AlertsPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
	'update_texts',
	'update_dates',
	'update_publish_status',
] as const;

export const AlertsPermissionActionsSchema = z.enum(AlertsPermissionActionsValues);

export type AlertsPermissionActions = z.infer<typeof AlertsPermissionActionsSchema>;

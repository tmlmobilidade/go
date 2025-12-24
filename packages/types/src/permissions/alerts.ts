/* * */

import { z } from 'zod';

/* * */

export const AlertsPermissionSchema = z.object({
	action: z.enum([
		'create_realtime',
		'create_scheduled',
		'delete_realtime',
		'delete_scheduled',
		'read_realtime',
		'read_scheduled',
		'lock_realtime',
		'lock_scheduled',
		'update_realtime',
		'update_scheduled',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('alerts'),
});

export type AlertsPermission = z.infer<typeof AlertsPermissionSchema>;

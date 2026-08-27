/* * */

import { z } from 'zod';

/* * */

export const AlertsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
		'update_texts',
		'update_dates',
		'update_publish_status',
		'export',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
		reference_types: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('alerts'),
});

export type AlertsPermission = z.infer<typeof AlertsPermissionSchema>;

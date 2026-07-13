/* * */

import { z } from 'zod';

/* * */

export const PlansPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'read_controller',
		'read_pcgi_legacy',
		'lock',
		'update',
		'update_controller',
		'update_feed_info_dates',
		'update_gtfs_plan',
		'update_pcgi_legacy',
		'read_apex_file',
		'update_apex_file',
		'delete_apex_file',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('plans'),
});

export type PlansPermission = z.infer<typeof PlansPermissionSchema>;

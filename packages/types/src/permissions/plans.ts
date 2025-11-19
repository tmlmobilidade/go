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
		'toggle_lock',
		'update',
		'update_controller',
		'update_feed_info_dates',
		'update_gtfs_plan',
		'update_pcgi_legacy',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).or(z.literal('allow_all')).default([]),
	}),
	scope: z.literal('plans'),
});

export type PlansPermission = z.infer<typeof PlansPermissionSchema>;

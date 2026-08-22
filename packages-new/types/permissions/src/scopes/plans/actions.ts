/* * */

import { z } from 'zod';

/* * */

const PlansPermissionActionsValues = [
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
	'send_apex_notification',
	'generate_pdf_posters',
] as const;

export const PlansPermissionActionsSchema = z.enum(PlansPermissionActionsValues);

export type PlansPermissionActions = z.infer<typeof PlansPermissionActionsSchema>;

/* * */

import { z } from 'zod';

/* * */

export const GtfsValidationsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'read',
		'lock',
		'request_approval',
		'update_processing_status',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('gtfs_validations'),
});

export type GtfsValidationsPermission = z.infer<typeof GtfsValidationsPermissionSchema>;

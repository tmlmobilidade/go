/* * */

import { z } from 'zod';

/* * */

export const GtfsValidationsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'read',
		'request_approval',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).or(z.literal('allow_all')).default([]),
	}),
	scope: z.literal('gtfs_validations'),
});

export type GtfsValidationsPermission = z.infer<typeof GtfsValidationsPermissionSchema>;

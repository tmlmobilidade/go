/* * */

import { z } from 'zod';

/* * */

export const ZonesPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
		'export',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('zones'),
});

export type ZonesPermission = z.infer<typeof ZonesPermissionSchema>;

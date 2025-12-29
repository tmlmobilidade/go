/* * */

import { z } from 'zod';

/* * */

export const PeriodsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('periods'),
});

export type PeriodsPermission = z.infer<typeof PeriodsPermissionSchema>;

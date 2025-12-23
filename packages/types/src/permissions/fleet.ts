/* * */

import { z } from 'zod';

/* * */

export const VehiclesPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
	]),
	resources: z.object({
		agency_id: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('fleet'),
});

export type VehiclesPermission = z.infer<typeof VehiclesPermissionSchema>;

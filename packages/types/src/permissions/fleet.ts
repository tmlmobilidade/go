/* * */

import { z } from 'zod';

/* * */

export const VehiclesPermissionSchema = z.object({
	action: z.enum([
		'create_vehicles',
		'delete_vehicles',
		'read_vehicles',
		'lock_vehicles',
		'update_vehicles',
	]),
	resources: z.object({
		agency_id: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('fleet'),
});

export type VehiclesPermission = z.infer<typeof VehiclesPermissionSchema>;

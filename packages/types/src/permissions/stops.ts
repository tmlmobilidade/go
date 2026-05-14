/* * */

import { z } from 'zod';

/* * */

export const StopsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
		'edit_coordinates',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
		municipality_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('stops'),
});

export type StopsPermission = z.infer<typeof StopsPermissionSchema>;

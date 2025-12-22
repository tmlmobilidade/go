/* * */

import { z } from 'zod';

/* * */

export const DatesPermissionSchema = z.object({
	action: z.enum([
		'create_annotations',
		'create_periods',
		'delete_annotations',
		'delete_periods',
		'read_annotations',
		'read_periods',
		'lock_annotations',
		'lock_periods',
		'update_annotations',
		'update_periods',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('dates'),
});

export type DatesPermission = z.infer<typeof DatesPermissionSchema>;

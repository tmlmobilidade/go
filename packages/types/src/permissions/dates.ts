/* * */

import { z } from 'zod';

/* * */

export const DatesPermissionSchema = z.object({
	action: z.enum([
		'create_annotations',
		'delete_annotations',
		'read_annotations',
		'update_annotations',
		'toggle_lock_annotations',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('dates'),
});

export type DatesPermission = z.infer<typeof DatesPermissionSchema>;

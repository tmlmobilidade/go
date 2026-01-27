/* * */

import { z } from 'zod';

/* * */

export const HolidaysPermissionSchema = z.object({
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
	scope: z.literal('holidays'),
});

export type HolidaysPermission = z.infer<typeof HolidaysPermissionSchema>;

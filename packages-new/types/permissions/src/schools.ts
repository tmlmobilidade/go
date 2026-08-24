/* * */

import { z } from 'zod';

/* * */

export const SchoolsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'update',
		'lock',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('schools'),
});

export type SchoolsPermission = z.infer<typeof SchoolsPermissionSchema>;

/* * */

import { z } from 'zod';

/* * */

export const LinesPermissionSchema = z.object({
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
	scope: z.literal('lines'),
});

export type LinesPermission = z.infer<typeof LinesPermissionSchema>;

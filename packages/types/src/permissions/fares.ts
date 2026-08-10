/* * */

import { z } from 'zod';

/* * */

export const FaresPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'lock',
		'nav',
		'update',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('fares'),
});

export type FaresPermission = z.infer<typeof FaresPermissionSchema>;

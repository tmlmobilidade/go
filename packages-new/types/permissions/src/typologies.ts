/* * */

import { z } from 'zod';

/* * */

export const TypologiesPermissionSchema = z.object({
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
	scope: z.literal('typologies'),
});

export type TypologiesPermission = z.infer<typeof TypologiesPermissionSchema>;

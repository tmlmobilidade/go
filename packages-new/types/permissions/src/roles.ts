/* * */

import { z } from 'zod';

/* * */

export const RolesPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
	]),
	scope: z.literal('roles'),
});

export type RolesPermission = z.infer<typeof RolesPermissionSchema>;

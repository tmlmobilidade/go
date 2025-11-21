/* * */

import { z } from 'zod';

/* * */

export const RolesPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'update',
	]),
	scope: z.literal('roles'),
});

export type RolesPermission = z.infer<typeof RolesPermissionSchema>;

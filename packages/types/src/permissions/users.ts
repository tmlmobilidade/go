/* * */

import { z } from 'zod';

/* * */

export const UsersPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'update',
	]),
	scope: z.literal('users'),
});

export type UsersPermission = z.infer<typeof UsersPermissionSchema>;

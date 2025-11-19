/* * */

import { z } from 'zod';

/* * */

export const StopsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'toggle_lock',
		'update',
	]),
	scope: z.literal('stops'),
});

export type StopsPermission = z.infer<typeof StopsPermissionSchema>;

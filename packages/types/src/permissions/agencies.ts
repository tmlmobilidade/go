/* * */

import { z } from 'zod';

/* * */

export const AgenciesPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'toggle_lock',
		'update',
	]),
	scope: z.literal('agencies'),
});

export type AgenciesPermission = z.infer<typeof AgenciesPermissionSchema>;

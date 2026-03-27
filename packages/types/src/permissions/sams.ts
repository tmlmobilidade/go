/* * */

import { z } from 'zod';

/* * */

export const SamsPermissionSchema = z.object({
	action: z.enum([
		'read',
	]),
	scope: z.literal('sams'),
});

export type SamsPermission = z.infer<typeof SamsPermissionSchema>;

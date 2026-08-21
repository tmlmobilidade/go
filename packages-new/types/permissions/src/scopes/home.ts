/* * */

import { z } from 'zod';

/* * */

export const HomePermissionSchema = z.object({
	action: z.enum([
		'read_links',
		'read_wiki',
	]),
	scope: z.literal('home'),
});

export type HomePermission = z.infer<typeof HomePermissionSchema>;

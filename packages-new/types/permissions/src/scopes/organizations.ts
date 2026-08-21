/* * */

import { z } from 'zod';

/* * */

export const OrganizationsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
	]),
	scope: z.literal('organizations'),
});

export type OrganizationsPermission = z.infer<typeof OrganizationsPermissionSchema>;

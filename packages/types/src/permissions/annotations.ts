/* * */

import { z } from 'zod';

/* * */

export const AnnotationsPermissionSchema = z.object({
	action: z.enum([
		'create',
		'delete',
		'read',
		'lock',
		'update',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('annotations'),
});

export type AnnotationsPermission = z.infer<typeof AnnotationsPermissionSchema>;

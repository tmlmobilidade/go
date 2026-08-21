/* * */

import { z } from 'zod';

/* * */

export const RidesPermissionSchema = z.object({
	action: z.enum([
		'acceptance_change_status',
		'acceptance_justify',
		'acceptance_lock',
		'acceptance_read',
		'analsys_lock',
		'analysis_lock',
		'analysis_read',
		'analysis_reprocess',
		'analysis_update',
		'audit_lock',
		'audit_read',
		'audit_update',
		'acceptance_comment_activity',
	]),
	resources: z.object({
		agency_ids: z.array(z.string()).default([]),
	}).default({}),
	scope: z.literal('rides'),
});

export type RidesPermission = z.infer<typeof RidesPermissionSchema>;

/* * */

export const SamsPermissionSchema = z.object({
	action: z.enum([
		'read',
		'export',
	]),
	scope: z.literal('sams'),
});

export type SamsPermission = z.infer<typeof SamsPermissionSchema>;

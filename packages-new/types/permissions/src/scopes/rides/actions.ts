/* * */

import { z } from 'zod';

/* * */

const RidesPermissionActionsValues = [
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
] as const;

export const RidesPermissionActionsSchema = z.enum(RidesPermissionActionsValues);

export type RidesPermissionActions = z.infer<typeof RidesPermissionActionsSchema>;

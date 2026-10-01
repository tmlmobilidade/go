/* * */

import { z } from 'zod';

/* * */

const GtfsValidationsPermissionActionsValues = [
	'create',
	'read',
	'lock',
	'request_approval',
	'update_processing_status',
] as const;

export const GtfsValidationsPermissionActionsSchema = z.enum(GtfsValidationsPermissionActionsValues);

export type GtfsValidationsPermissionActions = z.infer<typeof GtfsValidationsPermissionActionsSchema>;

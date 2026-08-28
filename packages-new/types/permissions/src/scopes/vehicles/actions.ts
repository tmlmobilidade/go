/* * */

import { z } from 'zod';

/* * */

const VehiclesPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const VehiclesPermissionActionsSchema = z.enum(VehiclesPermissionActionsValues);

export type VehiclesPermissionActions = z.infer<typeof VehiclesPermissionActionsSchema>;

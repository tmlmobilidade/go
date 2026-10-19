/* * */

import { z } from 'zod';

/* * */

const PerformancePermissionActionsValues = [
	'read',
] as const;

export const PerformancePermissionActionsSchema = z.enum(PerformancePermissionActionsValues);

export type PerformancePermissionActions = z.infer<typeof PerformancePermissionActionsSchema>;

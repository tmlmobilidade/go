/* * */

import { z } from 'zod';

/* * */

const SamsPermissionActionsValues = [
	'read',
	'export',
] as const;

export const SamsPermissionActionsSchema = z.enum(SamsPermissionActionsValues);

export type SamsPermissionActions = z.infer<typeof SamsPermissionActionsSchema>;

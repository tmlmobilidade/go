/* * */

import { z } from 'zod';

/* * */

const HomePermissionActionsValues = [
	'read_links',
] as const;

export const HomePermissionActionsSchema = z.enum(HomePermissionActionsValues);

export type HomePermissionActions = z.infer<typeof HomePermissionActionsSchema>;

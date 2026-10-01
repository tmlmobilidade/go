/* * */

import { z } from 'zod';

/* * */

const HomePermissionActionsValues = [
	'read_links',
	'read_wiki',
] as const;

export const HomePermissionActionsSchema = z.enum(HomePermissionActionsValues);

export type HomePermissionActions = z.infer<typeof HomePermissionActionsSchema>;

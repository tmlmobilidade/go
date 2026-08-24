/* * */

import { z } from 'zod';

/* * */

const EventsPermissionActionsValues = [
	'create',
	'delete',
	'read',
	'lock',
	'update',
] as const;

export const EventsPermissionActionsSchema = z.enum(EventsPermissionActionsValues);

export type EventsPermissionActions = z.infer<typeof EventsPermissionActionsSchema>;

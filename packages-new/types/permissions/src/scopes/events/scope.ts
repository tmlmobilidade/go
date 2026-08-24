/* * */

import { z } from 'zod';

/* * */

export const EventsPermissionScopeSchema = z.literal('events');

export type EventsPermissionScope = z.infer<typeof EventsPermissionScopeSchema>;

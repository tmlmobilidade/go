/* * */

import { z } from 'zod';

/* * */

export const AlertsPermissionScopeSchema = z.literal('alerts');

export type AlertsPermissionScope = z.infer<typeof AlertsPermissionScopeSchema>;

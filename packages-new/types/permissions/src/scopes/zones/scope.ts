/* * */

import { z } from 'zod';

/* * */

export const ZonesPermissionScopeSchema = z.literal('zones');

export type ZonesPermissionScope = z.infer<typeof ZonesPermissionScopeSchema>;

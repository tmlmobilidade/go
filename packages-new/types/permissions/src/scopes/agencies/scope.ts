/* * */

import { z } from 'zod';

/* * */

export const AgenciesPermissionScopeSchema = z.literal('agencies');

export type AgenciesPermissionScope = z.infer<typeof AgenciesPermissionScopeSchema>;

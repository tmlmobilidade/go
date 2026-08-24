/* * */

import { z } from 'zod';

/* * */

export const RolesPermissionScopeSchema = z.literal('roles');

export type RolesPermissionScope = z.infer<typeof RolesPermissionScopeSchema>;

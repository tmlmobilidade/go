/* * */

import { z } from 'zod';

/* * */

export const UsersPermissionScopeSchema = z.literal('users');

export type UsersPermissionScope = z.infer<typeof UsersPermissionScopeSchema>;

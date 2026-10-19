/* * */

import { z } from 'zod';

/* * */

export const SchoolsPermissionScopeSchema = z.literal('schools');

export type SchoolsPermissionScope = z.infer<typeof SchoolsPermissionScopeSchema>;

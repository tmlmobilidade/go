/* * */

import { z } from 'zod';

/* * */

export const OrganizationsPermissionScopeSchema = z.literal('organizations');

export type OrganizationsPermissionScope = z.infer<typeof OrganizationsPermissionScopeSchema>;

/* * */

import { z } from 'zod';

/* * */

export const PlansPermissionScopeSchema = z.literal('plans');

export type PlansPermissionScope = z.infer<typeof PlansPermissionScopeSchema>;

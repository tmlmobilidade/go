/* * */

import { z } from 'zod';

/* * */

export const HomePermissionScopeSchema = z.literal('home');

export type HomePermissionScope = z.infer<typeof HomePermissionScopeSchema>;

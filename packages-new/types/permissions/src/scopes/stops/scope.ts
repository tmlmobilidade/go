/* * */

import { z } from 'zod';

/* * */

export const StopsPermissionScopeSchema = z.literal('stops');

export type StopsPermissionScope = z.infer<typeof StopsPermissionScopeSchema>;

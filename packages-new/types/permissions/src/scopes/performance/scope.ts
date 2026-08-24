/* * */

import { z } from 'zod';

/* * */

export const PerformancePermissionScopeSchema = z.literal('performance');

export type PerformancePermissionScope = z.infer<typeof PerformancePermissionScopeSchema>;

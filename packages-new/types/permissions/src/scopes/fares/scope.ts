/* * */

import { z } from 'zod';

/* * */

export const FaresPermissionScopeSchema = z.literal('fares');

export type FaresPermissionScope = z.infer<typeof FaresPermissionScopeSchema>;

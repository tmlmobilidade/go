/* * */

import { z } from 'zod';

/* * */

export const SamsPermissionScopeSchema = z.literal('sams');

export type SamsPermissionScope = z.infer<typeof SamsPermissionScopeSchema>;

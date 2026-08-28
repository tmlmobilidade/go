/* * */

import { z } from 'zod';

/* * */

export const RidesPermissionScopeSchema = z.literal('rides');

export type RidesPermissionScope = z.infer<typeof RidesPermissionScopeSchema>;

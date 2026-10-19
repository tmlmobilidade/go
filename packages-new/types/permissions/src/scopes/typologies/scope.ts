/* * */

import { z } from 'zod';

/* * */

export const TypologiesPermissionScopeSchema = z.literal('typologies');

export type TypologiesPermissionScope = z.infer<typeof TypologiesPermissionScopeSchema>;

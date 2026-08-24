/* * */

import { z } from 'zod';

/* * */

export const HolidaysPermissionScopeSchema = z.literal('holidays');

export type HolidaysPermissionScope = z.infer<typeof HolidaysPermissionScopeSchema>;

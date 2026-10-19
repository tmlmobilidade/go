/* * */

import { z } from 'zod';

/* * */

export const LinesPermissionScopeSchema = z.literal('lines');

export type LinesPermissionScope = z.infer<typeof LinesPermissionScopeSchema>;

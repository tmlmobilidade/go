/* * */

import { z } from 'zod';

/* * */

export const YearPeriodsPermissionScopeSchema = z.literal('year_periods');

export type YearPeriodsPermissionScope = z.infer<typeof YearPeriodsPermissionScopeSchema>;

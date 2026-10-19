/* * */

import { z } from 'zod';

/* * */

export const GtfsValidationsPermissionScopeSchema = z.literal('gtfs_validations');

export type GtfsValidationsPermissionScope = z.infer<typeof GtfsValidationsPermissionScopeSchema>;

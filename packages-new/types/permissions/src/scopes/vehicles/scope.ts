/* * */

import { z } from 'zod';

/* * */

export const VehiclesPermissionScopeSchema = z.literal('vehicles');

export type VehiclesPermissionScope = z.infer<typeof VehiclesPermissionScopeSchema>;

/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const VehiclesAgencyRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for listing vehicles agencies.
 * It is intended for use in the vehicles module.
 */
export type VehiclesAgencyRequest = z.infer<typeof VehiclesAgencyRequestSchema>;

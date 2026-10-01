/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const StopsMunicipalityRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for listing stops municipalities.
 * It is intended for use in the stops module.
 */
export type StopsMunicipalityRequest = z.infer<typeof StopsMunicipalityRequestSchema>;

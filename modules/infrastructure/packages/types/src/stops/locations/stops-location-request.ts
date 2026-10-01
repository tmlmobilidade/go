/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const StopsLocationRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for listing stops locations.
 * It is intended for use in the stops module to filter the locations.
 */
export type StopsLocationRequest = z.infer<typeof StopsLocationRequestSchema>;

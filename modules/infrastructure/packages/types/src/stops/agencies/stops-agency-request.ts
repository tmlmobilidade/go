/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const StopsAgencyRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for listing stops agencies.
 * It is intended for use in the stops module.
 */
export type StopsAgencyRequest = z.infer<typeof StopsAgencyRequestSchema>;

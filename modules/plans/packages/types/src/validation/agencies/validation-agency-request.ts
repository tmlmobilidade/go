/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const ValidationAgencyRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for listing validation agencies.
 * It is intended for use in the plans module.
 */
export type ValidationAgencyRequest = z.infer<typeof ValidationAgencyRequestSchema>;

/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const LinesAgencyRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for listing permitted line agencies.
 * It is intended for use in the Offer module.
 */
export type LinesAgencyRequest = z.infer<typeof LinesAgencyRequestSchema>;

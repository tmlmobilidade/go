/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const SchoolsAgencyRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for listing schools agencies.
 * It is intended for use in the schools module.
 */
export type SchoolsAgencyRequest = z.infer<typeof SchoolsAgencyRequestSchema>;

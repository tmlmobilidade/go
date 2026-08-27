/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const PlanAgencyRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for listing plan agencies.
 * It is intended for use in the plans module.
 */
export type PlanAgencyRequest = z.infer<typeof PlanAgencyRequestSchema>;

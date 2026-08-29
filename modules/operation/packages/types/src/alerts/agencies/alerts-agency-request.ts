/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const AlertsAgencyRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for listing alerts agencies.
 * It is intended for use in the alerts module.
 */
export type AlertsAgencyRequest = z.infer<typeof AlertsAgencyRequestSchema>;

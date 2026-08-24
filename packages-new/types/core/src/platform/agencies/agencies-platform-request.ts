/* * */

import { PermissionsRegistrySchema } from '@tmlmobilidade/go-types-permissions';
import { z } from 'zod';

/* * */

export const AgenciesPlatformRequestSchema = z.object({
	permissions: PermissionsRegistrySchema,
});

/**
 * The request schema for getting agencies platform data
 * for a given scope.
 */
export type AgenciesPlatformRequest = z.infer<typeof AgenciesPlatformRequestSchema>;

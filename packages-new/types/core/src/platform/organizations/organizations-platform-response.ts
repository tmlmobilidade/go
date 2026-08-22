/* * */

import { OrganizationSchema } from '@/organizations/organization.js';
import { z } from 'zod';

/* * */

export const OrganizationsPlatformResponseSchema = OrganizationSchema;

/**
 * A read model for the organizations platform response.
 */
export type OrganizationsPlatformResponse = z.infer<typeof OrganizationsPlatformResponseSchema>;

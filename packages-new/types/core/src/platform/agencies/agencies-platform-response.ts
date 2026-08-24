/* * */

import { AgencySchema } from '@/agencies/agency.js';
import { z } from 'zod';

/* * */

export const AgenciesPlatformResponseSchema = AgencySchema.omit({
	apex: true,
	contact_emails_pta: true,
	contact_emails_pto: true,
});

/**
 * A read model for the agencies platform response.
 */
export type AgenciesPlatformResponse = z.infer<typeof AgenciesPlatformResponseSchema>;

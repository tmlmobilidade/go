/* * */

import { AgencySchema } from '@/agencies/agency.js';
import { z } from 'zod';

/* * */

export const AgenciesPlatformResponseSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	pta_name: true,
	short_name: true,
});

/* * */

/**
 * A read model for the agencies platform response.
 */
export type AgenciesPlatformResponse = z.infer<typeof AgenciesPlatformResponseSchema>;

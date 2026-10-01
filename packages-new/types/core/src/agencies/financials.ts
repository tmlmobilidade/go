/* * */

import { z } from 'zod';

/* * */

export const AgencyFinancialsSchema = z.object({
	price_per_km: z.coerce.number(),
	vkm_per_month: z.array(z.coerce.number()).length(12),
});

/* * */

export type AgencyFinancials = z.infer<typeof AgencyFinancialsSchema>;

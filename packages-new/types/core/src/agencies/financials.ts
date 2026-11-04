/* * */

import { z } from 'zod';

/* * */

export const AgencyPricePerKmSchema = z.union([z.number(), z.string().trim().min(1)])
	.pipe(z.coerce.number().finite().nonnegative());

export const AgencyFinancialsSchema = z.object({
	price_per_km: AgencyPricePerKmSchema,
	vkm_per_month: z.array(z.coerce.number()).length(12),
});

/* * */

export type AgencyFinancials = z.infer<typeof AgencyFinancialsSchema>;

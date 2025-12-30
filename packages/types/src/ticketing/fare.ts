/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

export const FareSchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1, 'At least one agency ID is required'),
	code: z.string().trim().min(1).max(10),
	currency_type: z.enum(['EUR']).default('EUR'),
	is_locked: z.boolean().default(false),
	name: z.string().trim().min(1).max(50),
	payment_method: z.enum(['0', '1']).default('0'), /* 0 = Onboard, 1 = Prepaid */
	price: z.coerce.number().min(0).default(0),
	transfers: z.enum(['0', '1', '2', 'unlimited']).default('0'), /* TRANSFERS (GTFS) */
});

/* * */

// Only name, code, and agency_ids are required for creation
export const CreateFareSchema = z.object({
	agency_ids: FareSchema.shape.agency_ids,
	code: FareSchema.shape.code,
	name: FareSchema.shape.name,
}).merge(
	FareSchema.omit({
		agency_ids: true,
		code: true,
		created_at: true,
		name: true,
		updated_at: true,
	}).partial(),
);

export const UpdateFareSchema = CreateFareSchema
	.omit({ created_by: true })
	.partial();

/* * */

export type Fare = z.infer<typeof FareSchema>;
export type CreateFareDto = z.infer<typeof CreateFareSchema>;
export type UpdateFareDto = z.infer<typeof UpdateFareSchema>;

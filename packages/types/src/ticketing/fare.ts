/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

export const FareSchema = DocumentSchema.extend({
	code: z.string().max(10).trim().default(''),
	currency_type: z.string().max(50).default('EUR'),
	is_locked: z.boolean().default(false),
	name: z.string().max(50).trim().default(''),
	payment_method: z.enum(['0', '1']).default('0'),
	price: z.coerce.number().min(0).default(0),
	transfers: z.enum(['0', '1', '2', 'unlimited']).default('0'),
});

/* * */

export const CreateFareSchema = FareSchema.omit({
	created_at: true,
	updated_at: true,
});

export const UpdateFareSchema = CreateFareSchema
	.omit({ created_by: true })
	.partial();

/* * */

export type Fare = z.infer<typeof FareSchema>;
export type CreateFareDto = z.infer<typeof CreateFareSchema>;
export type UpdateFareDto = z.infer<typeof UpdateFareSchema>;

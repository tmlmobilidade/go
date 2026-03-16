/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

export const FARE_PAYMENT_METHOD = {
	ONBOARD: '0',
	PREPAID: '1',
} as const;

export const FARE_TRANSFERS = {
	NONE: '0',
	ONE: '1',
	TWO: '2',
	UNLIMITED: 'unlimited',
} as const;

export const FARE_CURRENCY = {
	EUR: 'EUR',
} as const;

/* * */

export const FareSchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1, 'At least one agency ID is required'),
	code: z.string().trim().min(1).max(10),
	currency_type: z.enum([FARE_CURRENCY.EUR]).default(FARE_CURRENCY.EUR),
	is_locked: z.boolean().default(false),
	name: z.string().trim().min(1).max(50),
	payment_method: z.enum([FARE_PAYMENT_METHOD.ONBOARD, FARE_PAYMENT_METHOD.PREPAID]).default(FARE_PAYMENT_METHOD.ONBOARD),
	price: z.coerce.number().min(0).default(0),
	transfers: z.enum([FARE_TRANSFERS.NONE, FARE_TRANSFERS.ONE, FARE_TRANSFERS.TWO, FARE_TRANSFERS.UNLIMITED]).default(FARE_TRANSFERS.NONE),
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

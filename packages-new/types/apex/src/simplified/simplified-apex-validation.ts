/* * */

import { ApexValidationStatus, ApexValidationStatusSchema } from '@/simplified/apex-validation-status.js';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexValidationSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	card_serial_number: z.string(),
	category: z.enum(['prepaid', 'subscription', 'on_board_sale']).nullable(),
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	event_type: z.number(),
	is_ok: z.boolean(),
	is_ok_pcgi: z.boolean(),
	is_passenger: z.boolean(),
	line_id: z.string(),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	on_board_refund_id: z.string().nullable().default(null),
	on_board_sale_id: z.string().nullable().default(null),
	pattern_id: z.string(),
	product_id: z.string(),
	received_at: UnixTimestampSchema,
	stop_id: z.string(),
	trip_id: z.string().nullable().default(null),
	units_qty: z.number().nullable(),
	validation_status: ApexValidationStatusSchema,
	vehicle_id: z.number(),
});

export const UpdateSimplifiedApexValidationSchema = SimplifiedApexValidationSchema.partial();

/**
 * APEX Validations are APEX transactions of type 11 that are generated when a card holder touches a validator
 * reader (ex: bus validator, subway gate). These validation transactions represent the card holder's right to travel
 * on a given route, line, or vehicle. T11s have statuses that indicate if the card holder was allowed to travel
 * or not, and with which conditions. A validation also contains information about the card holder's card, the vehicle,
 * the validator machine, the route, and the time and location of the validation.
 */
export type SimplifiedApexValidation = z.infer<typeof SimplifiedApexValidationSchema>;
export type UpdateSimplifiedApexValidationDto = z.infer<typeof UpdateSimplifiedApexValidationSchema>;

/**
 * Validation statuses that are considered valid for the card holder to travel.
 */
export const ALLOWED_VALIDATION_STATUSES = [
	ApexValidationStatus._0_ContractValid,
	ApexValidationStatus._4_CardInWhiteList,
	ApexValidationStatus._5_ProfileInWhiteList,
	ApexValidationStatus._6_Interchange,
];

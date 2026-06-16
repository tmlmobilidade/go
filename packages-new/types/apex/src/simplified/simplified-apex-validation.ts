/* * */

import { ApexValidationStatusSchema } from '@/utils/validations-status.js';
import { CalendarDateSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexValidationSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	calendar_date: CalendarDateSchema,
	card_serial_number: z.string().nullable().default(null),
	category: z.enum(['prepaid', 'subscription', 'on_board_sale']).nullable(),
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	event_type: z.number(),
	is_ok: z.boolean(),
	is_ok_pcgi: z.boolean(),
	is_passenger: z.boolean(),
	line_id: z.string().nullable().default(null),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	on_board_refund_id: z.string().nullable().default(null),
	on_board_sale_id: z.string().nullable().default(null),
	pattern_id: z.string().nullable().default(null),
	product_id: z.string().nullable().default(null),
	received_at: UnixTimestampSchema,
	stop_id: z.string().nullable().default(null),
	trip_id: z.string().nullable().default(null),
	units_qty: z.number().nullable().default(null),
	updated_at: UnixTimestampSchema,
	validation_status: ApexValidationStatusSchema,
	vehicle_id: z.number().nullable().default(null),
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

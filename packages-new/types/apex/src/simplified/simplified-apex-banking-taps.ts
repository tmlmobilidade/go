/* * */

import { CalendarDateSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexBankingTapSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	banking_token: z.string(),
	calendar_date: CalendarDateSchema,
	card_brand: z.number(),
	card_pan: z.string(),
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	event_type: z.number().nullable(),
	is_ok: z.boolean(),
	is_ok_pcgi: z.boolean(),
	line_id: z.string(),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	pattern_id: z.string(),
	product_id: z.string(),
	received_at: UnixTimestampSchema,
	stop_id: z.string(),
	trip_id: z.string(),
	units_qty: z.number(),
	updated_at: UnixTimestampSchema,
	vehicle_id: z.number(),
});

/**
 * APEX Banking Taps are APEX transactions of type 20 that are generated
 * when a card holder with a banking card touches a validator reader.
 * These transactions represent the card holder's right to travel on a given route,
 * line, or vehicle, and are generated in a similar way to APEX Validations (T11s).
 * However, banking taps have some differences compared to regular validations,
 * such as the presence of banking-specific fields (ex: banking token, card brand, card pan).
 */
export type SimplifiedApexBankingTap = z.infer<typeof SimplifiedApexBankingTapSchema>;

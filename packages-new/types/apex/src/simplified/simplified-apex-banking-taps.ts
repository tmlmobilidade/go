/* * */

import { ApexBankingBrandSchema } from '@/utils/banking-brand.js';
import { ApexEventTypeSchema } from '@/utils/event-type.js';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexBankingTapSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	banking_token: z.string(),
	card_brand: ApexBankingBrandSchema,
	card_pan: z.string(),
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	event_type: ApexEventTypeSchema.nullable().default(null),
	group_dimension: z.number().default(1),
	is_ok: z.boolean(),
	is_ok_pcgi: z.boolean(),
	line_id: z.string().nullable().default(null),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	pattern_id: z.string().nullable().default(null),
	product_id: z.string().nullable().default(null),
	received_at: UnixTimestampSchema,
	stop_id: z.string(),
	trip_id: z.string().nullable().default(null),
	updated_at: UnixTimestampSchema,
	vehicle_id: z.number().nullable().default(null),
}).transform((val) => {
	// Setup the individual conditions to consider
	// this transaction as OK or NOT OK
	const hasDeviceId = !!val.device_id;
	const hasAseCounterValue = !!val.mac_ase_counter_value && val.mac_ase_counter_value > 0;
	const hasMacSamSerialNumber = !!val.mac_sam_serial_number;
	const hasCardBrand = !!val.card_brand;
	const hasCardPan = !!val.card_pan;
	// Combine the individual conditions
	const isOk = hasDeviceId && hasAseCounterValue && hasMacSamSerialNumber && hasCardBrand && hasCardPan;
	// Return the transformed value
	return { ...val, is_ok: isOk };
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

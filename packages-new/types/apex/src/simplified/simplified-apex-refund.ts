/* * */

import { ApexCardTypeSchema } from '@/utils/card-type.js';
import { ApexPaymentMethodSchema } from '@/utils/payment-method.js';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexOnBoardRefundSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	card_physical_type: ApexCardTypeSchema,
	card_serial_number: z.string().nullable().default(null),
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	is_ok: z.boolean().default(false),
	is_ok_pcgi: z.boolean().default(false),
	line_id: z.string().nullable().default(null),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	on_board_sale_id: z.string().nullable().default(null),
	pattern_id: z.string().nullable().default(null),
	payment_method: ApexPaymentMethodSchema,
	price: z.number(),
	product_id: z.string(),
	product_quantity: z.number(),
	received_at: UnixTimestampSchema,
	stop_id: z.string().nullable().default(null),
	trip_id: z.string().nullable().default(null),
	updated_at: UnixTimestampSchema,
	validation_id: z.string().nullable().default(null),
	vehicle_id: z.number().nullable().default(null),
}).transform((val) => {
	// Setup the individual conditions to consider
	// this transaction as OK or NOT OK
	const hasStopId = !!val.stop_id;
	const hasDeviceId = !!val.device_id;
	const hasProductId = !!val.product_id;
	const hasAseCounterValue = !!val.mac_ase_counter_value && val.mac_ase_counter_value > 0;
	const hasMacSamSerialNumber = !!val.mac_sam_serial_number;
	// Combine the individual conditions
	const isOk = hasStopId && hasDeviceId && hasProductId && hasAseCounterValue && hasMacSamSerialNumber;
	// Return the transformed value
	return { ...val, is_ok: isOk };
});

/**
 * APEX OnBoard Refunds are APEX transactions of type 3 that are generated whenever a sale
 * of an on-board ticket occurs. Even though sales can be of anything (tickets, cards, contracts, merchandising items)
 * and anywhere (inside vehicles, at vending machines, at ticket offices or online), here they are already filtered
 * for on-board ticket sales inside vehicles only. Refunds of tickets when inside vehicles also generate a validation transaction.
 * Refunds can be refunded, and refunds are also APEX transactions of type 3.
 */
export type SimplifiedApexOnBoardRefund = z.infer<typeof SimplifiedApexOnBoardRefundSchema>;

/* * */

import { CalendarDateSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexOnBoardRefundSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	block_id: z.string().nullable().default(null),
	calendar_date: CalendarDateSchema,
	card_physical_type: z.number(),
	card_serial_number: z.string(),
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	duty_id: z.string().nullable().default(null),
	line_id: z.string().nullable().default(null),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	on_board_sale_id: z.string().nullable().default(null),
	pattern_id: z.string().nullable().default(null),
	payment_method: z.number(),
	price: z.number(),
	product_long_id: z.string(),
	product_quantity: z.number(),
	received_at: UnixTimestampSchema,
	stop_id: z.string().nullable().default(null),
	trip_id: z.string().nullable().default(null),
	validation_id: z.string().nullable().default(null),
	vehicle_id: z.number().nullable().default(null),
});

export const UpdateSimplifiedApexOnBoardRefundSchema = SimplifiedApexOnBoardRefundSchema.partial();

/**
 * APEX OnBoard Refunds are APEX transactions of type 3 that are generated whenever a sale
 * of an on-board ticket occurs. Even though sales can be of anything (tickets, cards, contracts, merchandising items)
 * and anywhere (inside vehicles, at vending machines, at ticket offices or online), here they are already filtered
 * for on-board ticket sales inside vehicles only. Refunds of tickets when inside vehicles also generate a validation transaction.
 * Refunds can be refunded, and refunds are also APEX transactions of type 3.
 */
export type SimplifiedApexOnBoardRefund = z.infer<typeof SimplifiedApexOnBoardRefundSchema>;
export type UpdateSimplifiedApexOnBoardRefundDto = z.infer<typeof UpdateSimplifiedApexOnBoardRefundSchema>;

/* * */

import { DocumentSchema } from '@/_common/document.js';
import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const SimplifiedApexOnBoardSaleSchema = DocumentSchema
	.omit({ created_by: true, is_locked: true, updated_by: true })
	.extend({
		agency_id: z.string(),
		apex_version: z.string(),
		block_id: z.string().nullable(),
		card_physical_type: z.number(),
		card_serial_number: z.string(),
		device_id: z.string(),
		duty_id: z.string().nullable(),
		is_passenger: z.boolean(),
		line_id: z.string().nullable(),
		mac_ase_counter_value: z.number(),
		mac_sam_serial_number: z.number(),
		on_board_refund_id: z.string().nullable(),
		pattern_id: z.string().nullable(),
		payment_method: z.number(),
		price: z.number(),
		product_long_id: z.string(),
		product_quantity: z.number(),
		received_at: UnixTimestampSchema,
		stop_id: z.string().nullable(),
		trip_id: z.string().nullable(),
		validation_id: z.string().nullable(),
		vehicle_id: z.number().nullable(),
	});

export const UpdateSimplifiedApexOnBoardSaleSchema = SimplifiedApexOnBoardSaleSchema.partial();

/**
 * APEX OnBoard Sales are APEX transactions of type 3 that are generated whenever a sale
 * of an on-board ticket occurs. Even though sales can be of anything (tickets, cards, contracts, merchandising items)
 * and anywhere (inside vehicles, at vending machines, at ticket offices or online), here they are already filtered
 * for on-board ticket sales inside vehicles only. Sales of tickets when inside vehicles also generate a validation transaction.
 * Sales can be refunded, and refunds are also APEX transactions of type 3.
 */
export type SimplifiedApexOnBoardSale = z.infer<typeof SimplifiedApexOnBoardSaleSchema>;
export type UpdateSimplifiedApexOnBoardSaleDto = z.infer<typeof UpdateSimplifiedApexOnBoardSaleSchema>;

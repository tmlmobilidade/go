/* * */

import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const SimplifiedApexInspectionSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	card_serial_number: z.string(),
	control_destination_stop_id: z.string(),
	control_origin_stop_id: z.string(),
	control_status: z.number(),
	created_at: UnixTimeStampSchema,
	device_id: z.string(),
	environment_status: z.number(),
	inspection_id: z.string().nullable(),
	is_ok: z.boolean(),
	is_ok_pcgi: z.boolean(),
	line_id: z.string(),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	on_board_refund_id: z.string().nullable(),
	on_board_sale_id: z.string().nullable(),
	pattern_id: z.string(),
	product_id: z.string(),
	received_at: UnixTimeStampSchema,
	trip_id: z.string(),
	vehicle_id: z.number(),
});

/**
 * APEX Inspection are APEX transactions of type 16 that are generated
 * when a card holder's inspection decision is recorded by a controller on board a vehicle.
 * These transactions represent the decision made regarding the card holder's inspection,
 * and contain information about the card holder's card, the vehicle,
 * the controller, the route, and the time and location of the decision.
 * s have statuses that indicate if the card holder was found
 * to be in compliance with the fare rules or not, and with which conditions.
 */
export type SimplifiedApexInspection = z.infer<typeof SimplifiedApexInspectionSchema>;

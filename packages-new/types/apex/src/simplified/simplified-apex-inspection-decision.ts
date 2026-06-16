/* * */

import { CalendarDateSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexInspectionDecisionSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	calendar_date: CalendarDateSchema,
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	final_control_status: z.number(),
	inspection_decision_id: z.string().nullable(),
	is_ok: z.boolean(),
	is_ok_pcgi: z.boolean(),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	received_at: UnixTimestampSchema,
});

/**
 * APEX Inspections are APEX transactions of type 15 that are generated
 * when a card holder is inspected by a controller on board a vehicle.
 * These transactions represent the card holder's inspection event,
 * and contain information about the card holder's card, the vehicle,
 * the controller, the route, and the time and location of the inspection.
 * Inspections have statuses that indicate if the card holder was found
 * to be in compliance with the fare rules or not, and with which conditions.
 */
export type SimplifiedApexInspectionDecision = z.infer<typeof SimplifiedApexInspectionDecisionSchema>;

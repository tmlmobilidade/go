/* * */

import { ApexControlStatusSchema } from '@/utils/control-status.js';
import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexInspectionDecisionSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	device_id: z.string(),
	final_control_status: ApexControlStatusSchema,
	inspection_id: z.string().nullable().default(null),
	is_ok: z.boolean().default(false),
	is_ok_pcgi: z.boolean().default(false),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	operational_date: OperationalDateIntSchema,
	received_at: UnixTimestampSchema,
	transaction_date: UnixTimestampSchema,
	updated_at: UnixTimestampSchema,
}).transform((val) => {
	// Setup the individual conditions to consider
	// this transaction as OK or NOT OK
	const hasDeviceId = !!val.device_id;
	const hasAseCounterValue = !!val.mac_ase_counter_value && val.mac_ase_counter_value > 0;
	const hasMacSamSerialNumber = !!val.mac_sam_serial_number;
	const hasFinalControlStatus = !!val.final_control_status;
	const hasInspectionId = !!val.inspection_id;
	// Combine the individual conditions
	const isOk = hasDeviceId && hasAseCounterValue && hasMacSamSerialNumber && hasFinalControlStatus && hasInspectionId;
	// Return the transformed value
	return { ...val, is_ok: isOk };
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

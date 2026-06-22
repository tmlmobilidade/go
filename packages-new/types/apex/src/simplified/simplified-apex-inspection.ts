/* * */

import { ApexControlStatusSchema } from '@/utils/control-status.js';
import { ApexEnvironmentStatusSchema } from '@/utils/environment-status.js';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexInspectionSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	card_serial_number: z.string().nullable().default(null),
	control_destination_stop_id: z.string().nullable().default(null),
	control_origin_stop_id: z.string().nullable().default(null),
	control_status: ApexControlStatusSchema,
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	environment_status: ApexEnvironmentStatusSchema,
	inspection_id: z.string().nullable().default(null),
	is_ok: z.boolean().default(false),
	is_ok_pcgi: z.boolean().default(false),
	line_id: z.string(),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	pattern_id: z.string().nullable().default(null),
	product_id: z.string().nullable().default(null),
	received_at: UnixTimestampSchema,
	trip_id: z.string().nullable().default(null),
	updated_at: UnixTimestampSchema,
	vehicle_id: z.number().nullable().default(null),
}).transform((val) => {
	// Setup the individual conditions to consider
	// this transaction as OK or NOT OK
	const hasDeviceId = !!val.device_id;
	const hasAseCounterValue = !!val.mac_ase_counter_value && val.mac_ase_counter_value > 0;
	const hasMacSamSerialNumber = !!val.mac_sam_serial_number;
	const hasControlStatus = !!val.control_status;
	// Combine the individual conditions
	const isOk = hasDeviceId && hasAseCounterValue && hasMacSamSerialNumber && hasControlStatus;
	// Return the transformed value
	return { ...val, is_ok: isOk };
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

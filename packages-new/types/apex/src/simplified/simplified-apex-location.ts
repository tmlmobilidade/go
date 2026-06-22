/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexLocationSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	is_ok: z.boolean().default(false),
	is_ok_pcgi: z.boolean().default(false),
	line_id: z.string(),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	pattern_id: z.string(),
	received_at: UnixTimestampSchema,
	stop_id: z.string(),
	trip_id: z.string().nullable().default(null),
	updated_at: UnixTimestampSchema,
	vehicle_id: z.number().nullable().default(null),
}).transform((val) => {
	// Setup the individual conditions to consider
	// this transaction as OK or NOT OK
	const hasStopId = !!val.stop_id;
	const hasDeviceId = !!val.device_id;
	const hasLineId = !!val.line_id;
	const hasPatternId = !!val.pattern_id;
	const hasVehicleId = !!val.vehicle_id;
	const hasAseCounterValue = !!val.mac_ase_counter_value && val.mac_ase_counter_value > 0;
	const hasMacSamSerialNumber = !!val.mac_sam_serial_number;
	// Combine the individual conditions
	const isOk = hasStopId && hasDeviceId && hasLineId && hasPatternId && hasAseCounterValue && hasMacSamSerialNumber && hasVehicleId;
	// Return the transformed value
	return { ...val, is_ok: isOk };
});

/**
 * APEX Locations are APEX transactions of type 19 that are generated every time the
 * setContext or setLocation functions are called. These functions are used to set
 * the service context of the validator machine, allowing for the correct sale and validation
 * of products. In summary, these transactions are generated every time the vehicle has a change
 * in the current stop ID, trip ID, route ID, pattern ID, etc.
 */
export type SimplifiedApexLocation = z.infer<typeof SimplifiedApexLocationSchema>;

/* * */

import { ApexEventTypeSchema } from '@/utils/event-type.js';
import { ApexValidationCategorySchema } from '@/utils/validation-category.js';
import { ApexValidationStatusSchema, ValidApexValidationStatusSchema } from '@/utils/validation-status.js';
import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexValidationSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	card_serial_number: z.string().nullable().default(null),
	category: ApexValidationCategorySchema.default('subscription'),
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	event_type: ApexEventTypeSchema,
	is_ok: z.boolean(),
	is_ok_pcgi: z.boolean(),
	is_passenger: z.boolean(),
	line_id: z.string().nullable().default(null),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	on_board_refund_id: z.string().nullable().default(null),
	on_board_sale_id: z.string().nullable().default(null),
	operational_date: OperationalDateIntSchema,
	pattern_id: z.string().nullable().default(null),
	product_id: z.string().nullable().default(null),
	received_at: UnixTimestampSchema,
	stop_id: z.string().nullable().default(null),
	trip_id: z.string().nullable().default(null),
	units_qty: z.number().nullable().default(null),
	updated_at: UnixTimestampSchema,
	validation_status: ApexValidationStatusSchema,
	vehicle_id: z.number().nullable().default(null),
}).transform((val) => {
	// Check whether the transaction has a valid units quantity field
	// and allow zero as valid value (for subsidized trips). In those cases,
	// the validation is considered to be of category 'prepaid'.
	if (val.units_qty && val.units_qty >= 0) return { ...val, category: 'prepaid' };
	// Check if a sale transaction is associated with this validation.
	// If so, the validation is considered to be of category 'on_board_sale'.
	if (val.on_board_sale_id) return { ...val, category: 'on_board_sale' };
	// If no other category is detected, the validation is considered
	// to be of category 'subscription'.
	return { ...val, category: 'subscription' };
}).transform((val) => {
	// Setup the individual conditions to consider
	// this transaction as OK or NOT OK
	const hasStopId = !!val.stop_id;
	const hasDeviceId = !!val.device_id;
	const hasProductId = !!val.product_id;
	const hasAseCounterValue = !!val.mac_ase_counter_value && val.mac_ase_counter_value > 0;
	const hasMacSamSerialNumber = !!val.mac_sam_serial_number;
	const hasValidationStatus = !!val.validation_status;
	// Combine the individual conditions
	const isOk = hasStopId && hasDeviceId && hasProductId && hasAseCounterValue && hasMacSamSerialNumber && hasValidationStatus;
	// Return the transformed value
	return { ...val, is_ok: isOk };
}).transform((val) => {
	// Setup the individual conditions to consider
	// this transaction as a valid passenger
	const isValidValidationStatus = ValidApexValidationStatusSchema.safeParse(val.validation_status).success;
	const isNotRefunded = val.on_board_refund_id == null;
	// Combine the individual conditions
	const isPassenger = val.is_ok && isValidValidationStatus && isNotRefunded;
	// Return the transformed value
	return { ...val, is_passenger: isPassenger };
});

/**
 * APEX Validations are APEX transactions of type 11 that are generated when a card holder touches a validator
 * reader (ex: bus validator, subway gate). These validation transactions represent the card holder's right to travel
 * on a given route, line, or vehicle. T11s have statuses that indicate if the card holder was allowed to travel
 * or not, and with which conditions. A validation also contains information about the card holder's card, the vehicle,
 * the validator machine, the route, and the time and location of the validation.
 */
export type SimplifiedApexValidation = z.infer<typeof SimplifiedApexValidationSchema>;

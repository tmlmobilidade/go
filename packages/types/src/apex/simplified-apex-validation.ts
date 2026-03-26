/* * */

import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const ApexValidationStatus = {

	/**
	 * VALID:
	 * The card holder had a valid contract for the given context.
	 */
	_0_ContractValid: 0,

	/**
	 * INVALID:
	 * The card holder already has a valid validation for the given context.
	 */
	_1_Antipassback: 1,

	/**
	 * INVALID:
	 * The card holder's card is in the black list.
	 */
	_2_CardInBlackList: 2,

	/**
	 * INVALID:
	 * The validator SAM is in the black list.
	 */
	_3_SamInBlackList: 3,

	/**
	 * VALID:
	 * The card holder's card is in the white list.
	 */
	_4_CardInWhiteList: 4,

	/**
	 * VALID:
	 * The card holder's profile is in the white list.
	 */
	_5_ProfileInWhiteList: 5,

	/**
	 * VALID:
	 * The context allows for validation re-use.
	 */
	_6_Interchange: 6,

	/**
	 * INVALID:
	 * The validation could not be written to the card.
	 */
	_7_Interrupted: 7,

	/**
	 * INVALID:
	 * The card holder does not have a valid contract for the given context.
	 */
	_8_NoValidContract: 8,

	/**
	 * INVALID:
	 * The card holder's card is invalidated.
	 */
	_9_CardInvalidated: 9,

	/**
	 * INVALID:
	 * The card holder's card or the validator's SAM has no more space for events.
	 */
	_10_EventsFull: 10,

	/**
	 * INVALID:
	 * The card holder's card does not have enough units for the given context.
	 */
	_11_NotEnoughUnits: 11,

	/**
	 * INVALID:
	 * The card holder's contract has expired.
	 */
	_12_ContractExpired: 12,

	/**
	 * INVALID:
	 * The maximum value for the validation status. This is used to validate the status.
	 */
	_13_MaxValue: 13,

} as const;

export const ApexValidationStatusSchema = z.nativeEnum(ApexValidationStatus);

/* * */

export const SimplifiedApexValidationSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	card_serial_number: z.string(),
	category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
	created_at: UnixTimeStampSchema,
	device_id: z.string(),
	event_type: z.number(),
	is_passenger: z.boolean(),
	line_id: z.string(),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	on_board_refund_id: z.string().nullable(),
	on_board_sale_id: z.string().nullable(),
	pattern_id: z.string(),
	product_id: z.string(),
	received_at: UnixTimeStampSchema,
	stop_id: z.string(),
	trip_id: z.string(),
	units_qty: z.number().nullable(),
	updated_at: UnixTimeStampSchema,
	validation_status: ApexValidationStatusSchema,
	vehicle_id: z.number(),
});

export const UpdateSimplifiedApexValidationSchema = SimplifiedApexValidationSchema.partial();

/**
 * APEX Validations are APEX transactions of type 11 that are generated when a card holder touches a validator
 * reader (ex: bus validator, subway gate). These validation transactions represent the card holder's right to travel
 * on a given route, line, or vehicle. T11s have statuses that indicate if the card holder was allowed to travel
 * or not, and with which conditions. A validation also contains information about the card holder's card, the vehicle,
 * the validator machine, the route, and the time and location of the validation.
 */
export type SimplifiedApexValidation = z.infer<typeof SimplifiedApexValidationSchema>;
export type UpdateSimplifiedApexValidationDto = z.infer<typeof UpdateSimplifiedApexValidationSchema>;

/**
 * Validation statuses that are considered valid for the card holder to travel.
 */
export const ALLOWED_VALIDATION_STATUSES = [
	ApexValidationStatus._0_ContractValid,
	ApexValidationStatus._4_CardInWhiteList,
	ApexValidationStatus._5_ProfileInWhiteList,
	ApexValidationStatus._6_Interchange,
];

/* * */

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

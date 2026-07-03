/* * */

import { z } from 'zod';

/* * */

export const ApexValidationStatusValues = [

	/**
	 * VALID
	 * The validation was executed successfully through the card contract.
	 * The validation can be accepted.
	 */
	'0',

	/**
	 * ANTIPASSBACK
	 * The validation was blocked due to an antipassback event.
	 * The validation should be rejected.
	 */
	'1',

	/**
	 * CARD IN BLACKLIST
	 * The validation was blocked because the card is in the blacklist.
	 * The validation should be rejected.
	 */
	'2',

	/**
	 * SAM IN BLACKLIST
	 * The validation was blocked because the SAM is in the blacklist.
	 * The validation should be rejected.
	 */
	'3',

	/**
	 * CARD IN WHITELIST
	 * The validation was executed successfully through the card whitelist.
	 * The validation should be accepted.
	 */
	'4',

	/**
	 * PROFILE IN WHITELIST
	 * The validation was executed successfully through the profile whitelist.
	 * The validation should be accepted.
	 */
	'5',

	/**
	 * INTERCHANGE
	 * The validation was executed successfully using an interchange.
	 * No additional unit counter was used in this validation and the validation can be accepted.
	 */
	'6',

	/**
	 * INTERRUPTED
	 * The validation was interrupted. This result should be discarded and a new validation should be performed.
	 */
	'7',

	/**
	 * NO VALID CONTRACT
	 * The validation was not performed because there is no valid contract on the card.
	 * The validation should be rejected.
	 */
	'8',

	/**
	 * CARD IS INVALIDATED
	 * The validation was blocked because the card has been invalidated.
	 * The validation should be rejected.
	 */
	'9',

	/**
	 * EVENT IS FULL
	 * The validation was not performed because the event is full.
	 * The validation should be rejected.
	 * Note: This status only applies to the K_CARD_DATAMODEL_VIVA_V_1 data model. (Legacy)
	 */
	'10',

	/**
	 * NOT ENOUGH UNITS
	 * The validation was not performed because there are not enough units.
	 * The validation should be rejected.
	 */
	'11',

	/**
	 * CONTRACT EXPIRED
	 * The validation was not performed because the contract has expired.
	 * The validation should be rejected.
	 */
	'12',

	/**
	 * MISSING PRESELECTION
	 * The validation was not performed because the contract requires preselection and it was not done.
	 * The validation should be rejected.
	 */
	'13',

	/**
	 * INVALID PRESELECTION
	 * The validation was not performed because the contract requires preselection and it was invalid.
	 * The validation should be rejected.
	 */
	'14',

	/**
	 * MAX VALUE
	 * Maximum value of the enum.
	 */
	'15',

] as const;

export const ApexValidationStatusSchema = z.enum(ApexValidationStatusValues);

export type ApexValidationStatus = z.infer<typeof ApexValidationStatusSchema>;

/* * */

export const ValidApexValidationStatusValues = [
	'0',
	'4',
	'5',
	'6',
] as const satisfies ApexValidationStatus[];

export const ValidApexValidationStatusSchema = z.enum(ValidApexValidationStatusValues);

export type ValidApexValidationStatus = z.infer<typeof ValidApexValidationStatusSchema>;

/* * */

import { z } from 'zod';

/* * */

export const ApexEnvironmentStatusValues = [

	/**
	 * UNKNOWN
	 * The environment data is invalid.
	 * This status results from a lost card or a card that does not belong to the passenger.
	 * Note: This status is only used as an input parameter for the ApexGetInfractions() function.
	 */
	'0',

	/**
	 * VALID
	 * The card environment is valid.
	 */
	'1',

	/**
	 * CARD EXPIRED
	 * The card has expired.
	 */
	'2',

	/**
	 * CARD INVALIDATED
	 * The card application has been invalidated.
	 */
	'3',

	/**
	 * CARD CLEAN
	 * The card is clean (not customized).
	 */
	'4',

	/**
	 * CARD IN BLACKLIST
	 * The card is in the blacklist.
	 */
	'5',

	/**
	 * SAM IN BLACKLIST
	 * The SAM is in the blacklist.
	 */
	'6',

] as const;

export const ApexEnvironmentStatusSchema = z.enum(ApexEnvironmentStatusValues);

export type ApexEnvironmentStatus = z.infer<typeof ApexEnvironmentStatusSchema>;

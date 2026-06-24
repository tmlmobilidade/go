/* * */

import { z } from 'zod';

/* * */

export const ApexEventTypeValues = [

	/**
	 * IN_S
	 * Initial state.
	 */
	'0',

	/**
	 * EN_T
	 * Entry transaction.
	 */
	'1',

	/**
	 * EN_P
	 * Entry to the parking.
	 */
	'2',

	/**
	 * RE_T
	 * Re-entry transaction.
	 */
	'3',

	/**
	 * EX_T
	 * Exit transaction.
	 */
	'4',

	/**
	 * EX_P
	 * Exit from the parking.
	 */
	'5',

	/**
	 * PS_T
	 * Pre-selection transaction.
	 */
	'6',

	/**
	 * RL_T
	 * Reload transaction.
	 */
	'7',

	/**
	 * RC_T
	 * Recovery transaction.
	 */
	'10',

	/**
	 * EN_TR
	 * Entry transaction with recovery.
	 */
	'13',

	/**
	 * EX_TR
	 * Exit transaction with recovery.
	 */
	'14',

	/**
	 * EN_IT
	 * Entry transaction with overflow.
	 */
	'15',

	/**
	 * EN_P2
	 * Entry to the parking with overflow.
	 */
	'16',

	/**
	 * EX_P2
	 * Exit from the parking with overflow.
	 */
	'17',

	/**
	 * MAX VALUE
	 * Maximum value of the enum.
	 */
	'18',

] as const;

export const ApexEventTypeSchema = z.enum(ApexEventTypeValues);

export type ApexEventType = z.infer<typeof ApexEventTypeSchema>;

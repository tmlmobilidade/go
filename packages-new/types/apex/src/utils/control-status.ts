/* * */

import { z } from 'zod';

/* * */

export const ApexControlStatusValues = [

	/**
	 * UNDETERMINED
	 * The control position is undetermined.
	 */
	'0',

	/**
	 * VALID
	 * The card and/or contracts are valid for the current position.
	 */
	'1',

	/**
	 * INVALID
	 * The card and/or contracts are not valid for the current position.
	 */
	'2',

	/**
	 * MAYBE VALID
	 * The card and/or contracts are maybe valid for the current position.
	 */
	'3',

	/**
	 * MAX VALUE
	 * Maximum value of the enum.
	 */
	'4',

] as const;

export const ApexControlStatusSchema = z.enum(ApexControlStatusValues);

export type ApexControlStatus = z.infer<typeof ApexControlStatusSchema>;

/* * */

import { z } from 'zod';

/* * */

export const ApexBankingBrandValues = [

	/**
	 * UNDEFINED
	 */
	'0',

	/**
	 * VISA
	 */
	'1',

	/**
	 * MASTERCARD
	 */
	'2',

	/**
	 * AMEX
	 */
	'3',

	/**
	 * MAX VALUE
	 * Maximum value of the enum.
	 */
	'4',

] as const;

export const ApexBankingBrandSchema = z.enum(ApexBankingBrandValues);

export type ApexBankingBrand = z.infer<typeof ApexBankingBrandSchema>;

/* * */

import { z } from 'zod';

/* * */

export const ApexPaymentMethodValues = [

	/**
	 * UNDETERMINED
	 * The payment method is undefined.
	 */
	'0',

	/**
	 * MULTIPLE MEANS
	 * The payment method is multiple means.
	 */
	'1',

	/**
	 * CASH
	 * The payment method is cash.
	 */
	'2',

	/**
	 * CREDIT CARD
	 * The payment method is credit card.
	 */
	'3',

	/**
	 * ACCOUNT DEBIT
	 * The payment method is account debit.
	 */
	'4',

	/**
	 * PMB
	 * The payment method is PMB.
	 */
	'5',

	/**
	 * MB
	 * The payment method is MB.
	 */
	'6',

	/**
	 * VOUCHER
	 * The payment method is voucher.
	 */
	'7',

	/**
	 * MAX VALUE
	 * Maximum value of the enum.
	 */
	'8',

] as const;

export const ApexPaymentMethodSchema = z.enum(ApexPaymentMethodValues);

export type ApexPaymentMethod = z.infer<typeof ApexPaymentMethodSchema>;

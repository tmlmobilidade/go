/* * */

import { z } from 'zod';

/* * */

export const ApexCardTypeValues = [

	/**
	 * GTML
	 */
	'0',

	/**
	 * GTML2
	 */
	'1',

	/**
	 * CTS-512B
	 */
	'2',

	/**
	 * CDLIGHT
	 */
	'3',

	/**
	 * CD97
	 */
	'4',

	/**
	 * CT2000
	 */
	'5',

	/**
	 * CTS-256B
	 */
	'6',

	/**
	 * MIFARE Ultralight
	 */
	'7',

	/**
	 * SR176
	 */
	'8',

	/**
	 * CD21
	 */
	'9',

	/**
	 * MIFARE 1K
	 */
	'10',

	/**
	 * MIFARE 4K
	 */
	'11',

	/**
	 * SRIX512B
	 */
	'12',

	/**
	 * SRI512B
	 */
	'13',

	/**
	 * SRT512B
	 */
	'14',

	/**
	 * MODS512B
	 */
	'15',

	/**
	 * MODS2K
	 */
	'16',

	/**
	 * SR4K
	 */
	'17',

	/**
	 * MAGNETIC
	 */
	'18',

	/**
	 * PAYPASS
	 */
	'19',

	/**
	 * TANGO
	 */
	'20',

	/**
	 * CALYPSO_REV3
	 */
	'21',

	/**
	 * SRI2K
	 */
	'22',

	/**
	 * HCE
	 * Android Host Card Emulation.
	 */
	'23',

	/**
	 * MIFARE Ultralight EV1 (MFOUL11)
	 */
	'24',

	/**
	 * MIFARE Ultralight EV1 (MFOUL21)
	 */
	'25',

	/**
	 * CLAP REFERENCE
	 * Calypso Light application with reference to Hoplink.
	 */
	'26',

	/**
	 * MIFARE Desfire EV1
	 */
	'27',

	/**
	 * PAPER TICKET
	 * On-board paper ticket (receipt).
	 */
	'28',

	/**
	 * QR Code
	 */
	'29',

	/**
	 * EMV Banking Card
	 */
	'30',

	/**
	 * HCE Calypso Rev3
	 */
	'31',

	/**
	 * Calypso Basic
	 */
	'32',

	/**
	 * CLAP CLASSIC
	 * Calypso Light application with reference to Legacy.
	 */
	'33',

	/**
	 * MAX VALUE
	 * Maximum value of the enum.
	 */
	'34',

	/**
	 * UNKNOWN
	 * The card type is unknown.
	 */
	'255',

] as const;

export const ApexCardTypeSchema = z.enum(ApexCardTypeValues);

export type ApexCardType = z.infer<typeof ApexCardTypeSchema>;

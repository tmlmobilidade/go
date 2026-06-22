/* * */

import { z } from 'zod';

/* * */

export const SIMPLIFIED_APEX_TYPE_OPTIONS = [
	'location',
	'on_board_refund',
	'on_board_sale',
	'validation',
] as const;

export const SimplifiedApexTypeSchema = z.enum(SIMPLIFIED_APEX_TYPE_OPTIONS);

/**
 * The type of a simplified APEX transaction.
 * Use it when you need to use multiple APEX transactions
 * together in a single structure, such as when aggregating
 * APEX transactions for SAM analysis.
*/
export type SimplifiedApexType = z.infer<typeof SimplifiedApexTypeSchema>;

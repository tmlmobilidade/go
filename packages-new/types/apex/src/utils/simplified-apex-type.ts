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
 * This type should be used to represent the processing status
 * of various operations. It can be used in APIs, database operations,
 * or any other context where a processing status needs to be communicated.
*/
export type SimplifiedApexType = z.infer<typeof SimplifiedApexTypeSchema>;

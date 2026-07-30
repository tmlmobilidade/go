/* * */

import { z } from 'zod';

/* * */

export const GtfsTernaryValues = [
	'0', // NOT_SPECIFIED
	'1', // YES
	'2', // NO
] as const;

export const GtfsTernarySchema = z.enum(GtfsTernaryValues);

/**
 * The GTFS Ternary type represents a value that can be one of three states:
 * 0 (NOT_SPECIFIED), 1 (YES), or 2 (NO). This is used in GTFS to indicate
 * optional or unknown states for certain fields, such as whether a service
 * is enabled, disabled, or unknown.
 */
export type GtfsTernary = z.infer<typeof GtfsTernarySchema>;

/* * */

import { z } from 'zod';

/**
 * Represents a comparison entry for a GTFS validaton rule.
 */
export const GtfsValidationRuleCompareSchema = z.object({
	key: z.string(),
	value: z.string(),
});

export type GtfsValidationRuleCompare = z.infer<typeof GtfsValidationRuleCompareSchema>;

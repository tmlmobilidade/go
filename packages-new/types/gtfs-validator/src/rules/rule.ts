/* * */

import { GtfsValidationRuleCompareSchema } from '@/rules/compare.js';
import { SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/**
 * Represents a GTFS validator rule.
 * @see https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#211-rules
 */
export const GtfsValidationRuleSchema = z.record(
	z.string(),
	z.object({
		compare: z.array(GtfsValidationRuleCompareSchema).default([]).optional(),
		depends_on: z.array(z.string()).default([]).optional(),
		options: z.array(z.string()).default([]).optional(),
		severity: SeverityStatusSchema,
	}),
);

export type GtfsValidationRule = z.infer<typeof GtfsValidationRuleSchema>;

/* * */

import { GtfsValidationRuleCompareSchema } from '@/rules/compare.js';
import { type SeverityStatus, SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/**
 * Represents a GTFS validator rule.
 * @see https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#211-rules
 */
export const GtfsValidationRuleConfigSchema = z.object({
	compare: z.array(GtfsValidationRuleCompareSchema).default([]).optional(),
	depends_on: z.array(z.string()).default([]).optional(),
	options: z.array(z.string()).default([]).optional(),
	severity: SeverityStatusSchema,
});

export const GtfsValidationRuleSchema = z.record(z.string(), GtfsValidationRuleConfigSchema);

export type GtfsValidationRuleSeverity = SeverityStatus;
export type GtfsValidationRuleConfig = z.infer<typeof GtfsValidationRuleConfigSchema>;
export type GtfsValidationRule = z.infer<typeof GtfsValidationRuleSchema>;

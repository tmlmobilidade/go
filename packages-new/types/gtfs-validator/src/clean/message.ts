/* * */

import { SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsValidationMessageSchema = z.object({
	field: z.string(),
	file_name: z.string(),
	message: z.string(),
	rows: z.array(z.number()),
	rule_id: z.string(),
	severity: SeverityStatusSchema,
});

export type GtfsValidationMessage = z.infer<typeof GtfsValidationMessageSchema>;

/**
 * One entry per rule, mirroring the grouped summary the validator produces.
 * See GtfsValidationOutputRuleMessageSchema for why the grouping fields are lenient.
 */
export const GtfsValidationRuleMessageSchema = z.object({
	field: z.string(),
	file_name: z.string(),
	message: z.string(),
	messages: z.array(GtfsValidationMessageSchema).default([]),
	rows: z.array(z.number()).optional(),
	rule_id: z.string(),
	severity: SeverityStatusSchema,
	total_rows: z.number().default(0),
});

export type GtfsValidationRuleMessage = z.infer<typeof GtfsValidationRuleMessageSchema>;

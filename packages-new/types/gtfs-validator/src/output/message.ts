/* * */

import { SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsValidationOutputMessageSchema = z.object({
	field: z.string(),
	file_name: z.string(),
	message: z.string(),
	rows: z.array(z.number()),
	rule_id: z.string(),
	severity: SeverityStatusSchema,
});

export type GtfsValidationOutputMessage = z.infer<typeof GtfsValidationOutputMessageSchema>;

/**
 * One entry per rule: `message` is the rule's generic sentence, and `messages` holds
 * the errors and warnings it stands for, together in one array.
 *
 * `messages`, `total_rows` and `rows` are lenient so that validations stored before the
 * summary was grouped, which carry flat messages, still parse.
 */
export const GtfsValidationOutputRuleMessageSchema = z.object({
	field: z.string(),
	file_name: z.string(),
	message: z.string(),
	messages: z.array(GtfsValidationOutputMessageSchema).default([]),
	rows: z.array(z.number()).optional(),
	rule_id: z.string(),
	severity: SeverityStatusSchema,
	total_rows: z.number().default(0),
});

export type GtfsValidationOutputRuleMessage = z.infer<typeof GtfsValidationOutputRuleMessageSchema>;

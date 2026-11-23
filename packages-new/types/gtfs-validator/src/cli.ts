/* * */

import { SeverityStatusValues } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsValidationOutputMessageSchema, GtfsValidationOutputRuleMessageSchema, GtfsValidationOutputSummarySchema } from './output/index.js';
import { GtfsValidatiorRuleSchema, GtfsValidatorRuleIdSchema } from './rules/index.js';

/* * */

export const GtfsValidatorRuleSeverityValues = [...SeverityStatusValues, 'forbidden'] as const;
export const GtfsValidatorRuleSeveritySchema = z.string().transform(value => value.toLowerCase()).pipe(z.enum(GtfsValidatorRuleSeverityValues));

/** Configuration for one rule in the Go validator's rules array. */
export const GtfsValidatorCliRuleSchema = GtfsValidatiorRuleSchema.extend({
	depends_on: GtfsValidatorRuleIdSchema.array().optional(),
	rule_id: GtfsValidatorRuleIdSchema,
	severity: GtfsValidatorRuleSeveritySchema,
});

export type GtfsValidatorCliRule = z.infer<typeof GtfsValidatorCliRuleSchema>;

/** Read saved rule maps and emit the validator's rule array. */
export const GtfsValidatorRulesSchema = z.preprocess((rules) => {
	if (!rules || typeof rules !== 'object' || Array.isArray(rules)) return rules;
	return Object.entries(rules).map(([ruleId, rule]) => {
		if (!rule || typeof rule !== 'object' || Array.isArray(rule)) return rule;
		return { ...rule, rule_id: ruleId };
	});
}, GtfsValidatorCliRuleSchema.array().superRefine((rules, context) => {
	const ids = new Set<string>();
	for (const [index, { rule_id: ruleId }] of rules.entries()) {
		if (ids.has(ruleId)) context.addIssue({ code: 'custom', message: `Duplicate rule ID: ${ruleId}`, path: [index, 'rule_id'] });
		ids.add(ruleId);
	}
}));

const detailMessage = GtfsValidationOutputMessageSchema.extend({ severity: GtfsValidatorRuleSeveritySchema });
const ruleMessage = GtfsValidationOutputRuleMessageSchema.extend({
	messages: detailMessage.array(),
	severity: GtfsValidatorRuleSeveritySchema,
	total_rows: z.number(),
});

/** Report emitted by a completed Go validator run. */
export const GtfsValidatorCliSummarySchema = GtfsValidationOutputSummarySchema.extend({
	messages: ruleMessage.array(),
});

export type GtfsValidatorCliSummary = z.infer<typeof GtfsValidatorCliSummarySchema>;

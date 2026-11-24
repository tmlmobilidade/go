/* * */

import { SeverityStatusValues } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsValidatorRuleIdSchema } from './rule-ids.js';

/* * */

export const GtfsValidatorRuleSeverityValues = [...SeverityStatusValues, 'forbidden'] as const;
export const GtfsValidatorRuleSeveritySchema = z.string().toLowerCase().pipe(z.enum(GtfsValidatorRuleSeverityValues));

export type GtfsValidationRuleSeverity = z.infer<typeof GtfsValidatorRuleSeveritySchema>;

export const GtfsValidationRuleOptionsModifierSchema = z.strictObject({
	type: z.literal('options'),
	values: z.array(z.string()),
});

export const GtfsValidationRuleCompareModifierSchema = z.strictObject({
	type: z.literal('compare'),
	values: z.array(z.strictObject({ key: z.string(), value: z.string() })),
});

export const GtfsValidationRuleModifierSchema = z.discriminatedUnion('type', [
	GtfsValidationRuleOptionsModifierSchema,
	GtfsValidationRuleCompareModifierSchema,
]);

export type GtfsValidationRuleModifier = z.infer<typeof GtfsValidationRuleModifierSchema>;

export const GtfsValidationRuleSchema = z.strictObject({
	depends_on: z.array(GtfsValidatorRuleIdSchema).default([]),
	modifiers: GtfsValidationRuleModifierSchema.optional(),
	rule_id: GtfsValidatorRuleIdSchema,
	severity: GtfsValidatorRuleSeveritySchema,
});

export type GtfsValidationRule = z.infer<typeof GtfsValidationRuleSchema>;

export const GtfsValidatorRulesSchema = GtfsValidationRuleSchema.array().superRefine((rules, context) => {
	const ids = new Set<GtfsValidationRule['rule_id']>();
	for (const [index, { rule_id: ruleId }] of rules.entries()) {
		if (ids.has(ruleId)) context.addIssue({ code: 'custom', message: `Duplicate rule ID: ${ruleId}`, path: [index, 'rule_id'] });
		ids.add(ruleId);
	}
});

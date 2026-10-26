import { type AgencyPlans, AgencyPlansSchema } from '@tmlmobilidade/go-types-core';

/* * */

/** Rebuild edited rules from the same IDs displayed by the editor. */
export function getAgenciesDetailValidationRules(rules: AgencyPlans['validation_rules']): AgencyPlans['validation_rules'] {
	return Object.fromEntries(Object.entries(rules)
		.filter(([id]) => AgencyPlansSchema.shape.validation_rules.keySchema.safeParse(id).success));
}

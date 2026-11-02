import { type AgencyPlans } from '@tmlmobilidade/go-types-core';
import { GtfsValidatorRuleIdValues } from '@tmlmobilidade/go-types-gtfs-validator';

/* * */

const supportedRuleIds = new Set<string>(GtfsValidatorRuleIdValues);

/** Rebuild saved rules and dependencies from the same IDs displayed by the editor. */
export function getAgenciesDetailValidationRules(rules: AgencyPlans['validation_rules'] = {}): AgencyPlans['validation_rules'] {
	return Object.fromEntries(Object.entries(rules)
		.filter(([id]) => supportedRuleIds.has(id))
		.map(([id, rule]) => [id, Array.isArray(rule?.depends_on)
			? {
				...rule,
				// Remove retired IDs while retaining malformed values for schema validation.
				depends_on: rule.depends_on.filter(dependency => typeof dependency !== 'string' || supportedRuleIds.has(dependency)),
			}
			: rule]));
}

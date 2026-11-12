import { GtfsValidatorRuleIdValues, type GtfsValidatorRulesDraft } from '@tmlmobilidade/go-types-gtfs-validator';

/* * */

const supportedRuleIds = new Set<string>(GtfsValidatorRuleIdValues);

/**
 * Build the complete current ID map, dropping retired rules and dependencies.
 * New rules have no severity until the user chooses one. Unchanged settings keep
 * their identity so the form can distinguish pending cleanup from ordinary loads.
 */
export function getAgenciesDetailValidationRules(rules: GtfsValidatorRulesDraft = {}): GtfsValidatorRulesDraft {
	//

	//
	// A. Process rules

	return Object.fromEntries(GtfsValidatorRuleIdValues.map((id) => {
		const rule = rules[id];

		if (!rule) return [id, { depends_on: [] }];
		if (!Array.isArray(rule.depends_on)) return [id, rule];

		// Keep malformed values visible to strict schema validation.
		const dependencies = rule.depends_on.filter(dependency => typeof dependency !== 'string' || supportedRuleIds.has(dependency));
		return [id, dependencies.length === rule.depends_on.length ? rule : { ...rule, depends_on: dependencies }];
	}));
}

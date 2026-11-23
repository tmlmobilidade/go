import { type GtfsValidatorCliRule, type GtfsValidatorRuleDraft, GtfsValidatorRuleIdSchema, GtfsValidatorRuleIdValues, type GtfsValidatorRulesDraft } from '@tmlmobilidade/go-types-gtfs-validator';

/* * */

const supportedRuleIds = new Set<string>(GtfsValidatorRuleIdValues);

export type AgenciesDetailValidationRule = GtfsValidatorRuleDraft & Pick<GtfsValidatorCliRule, 'rule_id'>;

/** Convert editor settings or a previously saved map to the rules array. */
export function getAgenciesDetailValidationRules(rules: GtfsValidatorRulesDraft = {}): AgenciesDetailValidationRule[] {
	//

	//
	// A. Process rules

	return Object.entries(rules).flatMap(([id, rule]) => {
		const parsedId = GtfsValidatorRuleIdSchema.safeParse(id);
		if (!parsedId.success || !rule) return [];
		const entry = { ...rule, rule_id: parsedId.data };

		// Keep malformed values visible to strict schema validation.
		if (Array.isArray(entry.depends_on)) {
			entry.depends_on = entry.depends_on.filter(dependency => typeof dependency !== 'string' || supportedRuleIds.has(dependency.toLowerCase()));
		}
		return [entry];
	});
}

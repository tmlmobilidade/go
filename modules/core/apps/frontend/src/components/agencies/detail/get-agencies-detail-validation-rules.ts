import { GtfsValidatorRuleIdSchema, GtfsValidatorRulesSchema } from '@tmlmobilidade/go-types-gtfs-validator';

import { type AgenciesDetailValidationRule } from './AgenciesDetailValidationRules/types';

/* * */

type SavedRules = AgenciesDetailValidationRule[] | Record<string, Omit<AgenciesDetailValidationRule, 'rule_id'>>;

/* * */

/** Adapt saved maps and arrays that predate the modifier schema. */
export function getAgenciesDetailValidationRules(rules?: null | SavedRules): AgenciesDetailValidationRule[] {
	const parsedRules = GtfsValidatorRulesSchema.safeParse(rules);
	if (parsedRules.success) return parsedRules.data;

	const entries = Array.isArray(rules) ? rules.map(rule => [rule?.rule_id, rule] as const) : Object.entries(rules ?? {});

	return entries.flatMap<AgenciesDetailValidationRule>(([id, rule]) => {
		const parsedId = GtfsValidatorRuleIdSchema.safeParse(id);
		if (!parsedId.success || !rule) return [];

		const { compare, depends_on: dependencies, modifiers, options, ...config } = rule;
		const dependsOn = Array.isArray(dependencies)
			? dependencies.filter(dependency => typeof dependency !== 'string' || GtfsValidatorRuleIdSchema.safeParse(dependency).success)
			: dependencies ?? [];

		const entry = { ...config, depends_on: dependsOn, rule_id: parsedId.data };
		if (modifiers) return [{ ...entry, modifiers }];
		if (compare && options) return [{ ...entry, compare, options }];
		if (compare) return [{ ...entry, modifiers: { type: 'compare', values: compare } }];
		if (options) return [{ ...entry, modifiers: { type: 'options', values: options } }];
		return [entry];
	});
}

import { GtfsValidationRuleConfig, gtfsValidationRulesConfig } from '@tmlmobilidade/go-types-gtfs-validator';

export type NestedValidationRules = Record<string, Record<string, GtfsValidationRuleConfig | string>>;

const FILE_RULE_SUFFIX = '_file_required';

/* * */

export function buildConfiguredRules(): NestedValidationRules {
	const result: NestedValidationRules = {};

	for (const [ruleId, ruleConfig] of Object.entries(gtfsValidationRulesConfig) as [string, GtfsValidationRuleConfig][]) {
		const fileRuleId = ruleId.endsWith(FILE_RULE_SUFFIX)
			? ruleId
			: ruleConfig.depends_on?.find(dependency => dependency.endsWith(FILE_RULE_SUFFIX));

		if (!fileRuleId) continue;

		const groupName = fileRuleId.slice(0, -FILE_RULE_SUFFIX.length);
		result[groupName] ??= {};

		if (ruleId.endsWith(FILE_RULE_SUFFIX)) {
			result[groupName]._file = ruleConfig.severity;
			continue;
		}

		const { compare, options, severity } = ruleConfig;
		result[groupName][ruleId] = {
			...(compare && { compare }),
			...(options && { options }),
			severity,
		};
	}

	return result;
}

import { GtfsValidationRuleConfig, gtfsValidationRulesConfig } from '@tmlmobilidade/go-types-gtfs-validator';

export type NestedValidationRules = Record<string, Record<string, GtfsValidationRuleConfig | string>>;

/** File-presence rules define the group used by the Go validator JSON format. */
const FILE_RULE_SUFFIX = '_file_required';

/* * */

/** Builds the complete Go-validator rule shape from the shared flat config. */
export function buildConfiguredRules(): NestedValidationRules {
	const result: NestedValidationRules = {};

	// The shared configuration is flat. The Go validator expects rules grouped
	// by GTFS file, with the file-presence severity stored under `_file`.
	for (const [ruleId, ruleConfig] of Object.entries(gtfsValidationRulesConfig) as [string, GtfsValidationRuleConfig][]) {
		const fileRuleId = ruleId.endsWith(FILE_RULE_SUFFIX)
			? ruleId
			: ruleConfig.depends_on?.find(dependency => dependency.endsWith(FILE_RULE_SUFFIX));

		// Rules without a file dependency do not belong to this validator format.
		if (!fileRuleId) continue;

		const groupName = fileRuleId.slice(0, -FILE_RULE_SUFFIX.length);
		result[groupName] ??= {};

		if (ruleId.endsWith(FILE_RULE_SUFFIX)) {
			result[groupName]._file = ruleConfig.severity;
			continue;
		}

		// Keep only fields consumed by the validator instead of serializing UI
		// metadata from the shared configuration.
		const { compare, options, severity } = ruleConfig;
		result[groupName][ruleId] = {
			...(compare && { compare }),
			...(options && { options }),
			severity,
		};
	}

	return result;
}

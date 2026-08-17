import { type GtfsValidationRuleConfig, GtfsValidationRuleConfigSchema, gtfsValidationRulesConfig } from '@tmlmobilidade/go-types-gtfs-validator';

/* * */

type NestedValidationRules = Record<string, Record<string, GtfsValidationRuleConfig | string>>;

const FILE_RULE_SUFFIX = '_file_required';
const VALID_SEVERITIES = new Set(['error', 'forbidden', 'ignore', 'warning']);

/* * */

export function normalizeValidationRules(input: unknown): NestedValidationRules {
	const configuredRules = buildConfiguredRules();
	const parsedInput = parseInput(input);

	if (!isRecord(parsedInput)) return configuredRules;

	for (const [groupName, configuredGroup] of Object.entries(configuredRules)) {
		const inputGroup = parsedInput[groupName];
		if (!isRecord(inputGroup)) continue;

		for (const ruleId of Object.keys(configuredGroup)) {
			const inputRule = inputGroup[ruleId];

			if (ruleId === '_file') {
				if (typeof inputRule === 'string' && VALID_SEVERITIES.has(inputRule)) {
					configuredGroup[ruleId] = inputRule;
				}
				continue;
			}

			const parsedRule = GtfsValidationRuleConfigSchema.safeParse(inputRule);
			if (parsedRule.success) configuredGroup[ruleId] = parsedRule.data;
		}
	}

	return configuredRules;
}

/* * */

function buildConfiguredRules(): NestedValidationRules {
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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseInput(input: unknown): unknown {
	if (typeof input !== 'string') return input;

	try {
		return JSON.parse(input) as unknown;
	} catch {
		return null;
	}
}

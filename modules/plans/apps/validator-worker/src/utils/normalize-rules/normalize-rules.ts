import { GtfsValidationRuleConfigSchema } from '@tmlmobilidade/go-types-gtfs-validator';

/* * */

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

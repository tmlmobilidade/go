import { isRecord } from '@/lib/is-record.js';
import { parseInput } from '@/lib/parse-input.js';
import { GtfsValidationRuleConfigSchema } from '@tmlmobilidade/go-types-gtfs-validator';

import { buildConfiguredRules, NestedValidationRules } from './build-configuration-rules.js';

/* * */

const VALID_SEVERITIES = new Set(['error', 'forbidden', 'ignore', 'warning']);

/* * */

/**
 * Overlays valid agency rules on the complete shared configuration. Missing or
 * malformed values retain their centrally configured defaults.
 * @param input - The input to normalize.
 */
export function normalizeValidationRules(input: unknown): NestedValidationRules {
	//

	const configuredRules = buildConfiguredRules();
	const parsedInput = parseInput(input);

	if (!isRecord(parsedInput)) return configuredRules;

	for (const [groupName, configuredGroup] of Object.entries(configuredRules)) {
		const inputGroup = parsedInput[groupName];
		if (!isRecord(inputGroup)) continue;

		// Iterate configured rules rather than stored rules so unknown legacy keys
		// cannot leak into the payload sent to the Go validator.
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

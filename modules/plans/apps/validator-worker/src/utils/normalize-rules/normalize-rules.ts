import { GtfsValidationRuleConfigSchema } from '@tmlmobilidade/go-types-gtfs-validator';

import { buildConfiguredRules, NestedValidationRules } from './build-configuration-rules.js';

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

import { GtfsValidationRuleConfigSchema } from '@tmlmobilidade/go-types-gtfs-validator';

import { buildConfiguredRules, NestedValidationRules } from './build-configuration-rules.js';

/* * */

const VALID_SEVERITIES = new Set(['error', 'forbidden', 'ignore', 'warning']);

/* * */

/**
 * Overlays valid agency rules on the complete shared configuration. Missing or
 * malformed values retain their centrally configured defaults.
 */
export function normalizeValidationRules(input: unknown): NestedValidationRules {
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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseInput(input: unknown): unknown {
	// Mongo may contain either the structured object or its legacy JSON string.
	if (typeof input !== 'string') return input;

	try {
		return JSON.parse(input) as unknown;
	} catch {
		return null;
	}
}

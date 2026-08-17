import { type GtfsValidationRuleConfig, gtfsValidationRulesConfig } from '@tmlmobilidade/go-types-gtfs-validator';

/* * */

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

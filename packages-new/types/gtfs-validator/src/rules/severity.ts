import { ruleSeverities, type RuleSeverity } from './rules-severities.js';

/* * */

export function isRuleSeverity(value: unknown): value is RuleSeverity {
	return ruleSeverities.includes(value as RuleSeverity);
}

/** Validate that a value is a known severity, throwing with the config path otherwise. */
export function parseRuleSeverity(value: unknown, path: string): RuleSeverity {
	if (!isRuleSeverity(value)) {
		throw new Error(`${path}: invalid severity "${String(value)}"`);
	}
	return value;
}

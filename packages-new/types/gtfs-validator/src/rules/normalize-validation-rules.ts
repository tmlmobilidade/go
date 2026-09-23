import { isRecord } from './is-record.js';
import { type ValidationRulesInput } from './rules-inputs.js';
import { parseRuleSeverity } from './severity.js';

/* * */

/**
 * Validate saved rules against the editor's policy without changing them.
 * A rule absent from the input stays absent: the Go validator already treats
 * a missing severity as Ignore, so nothing here needs to write it out.
 * A rule that IS present must be complete: an entry without a severity, or
 * with an invalid one, is rejected instead of being silently accepted.
 *
 * This policy is stricter than the Go decoder and is kept here on purpose,
 * separate from the generated types. Unknown sections and keys are kept as
 * they are, so the result is cast to the input type rather than proven by it.
 */
export function normalizeValidationRules(input: unknown): ValidationRulesInput {
	const parsed: unknown = typeof input === 'string' ? JSON.parse(input) : input;
	if (parsed !== null && parsed !== undefined && !isRecord(parsed)) {
		throw new Error('Validation rules must be a JSON object');
	}
	const result = structuredClone(parsed ?? {}) as Record<string, unknown>;
	for (const [group, section] of Object.entries(result)) {
		if (!isRecord(section)) continue;
		for (const [key, value] of Object.entries(section)) {
			if (key === '_file') {
				parseRuleSeverity(value, `${group}.${key}`);
				continue;
			}
			if (!isRecord(value)) throw new Error(`${group}.${key}: expected a rule object`);
			if (!('severity' in value)) throw new Error(`${group}.${key}: missing severity`);
			parseRuleSeverity(value.severity, `${group}.${key}.severity`);
		}
	}
	return result as ValidationRulesInput;
}

import { isRecord } from './is-record.js';
import { ruleConfigKeys } from './rules-groups.js';
import { type ValidationRulesInput } from './rules-inputs.js';
import { parseRuleSeverity } from './severity.js';

/* * */

const currentRuleKeys = new Map<string, readonly string[]>(Object.entries(ruleConfigKeys));

/**
 * Remove obsolete rules and validate the remaining editor configuration.
 * A rule absent from the input stays absent: the Go validator already treats
 * a missing severity as Ignore, so nothing here needs to write it out.
 * A rule that IS present must be complete: an entry without a severity, or
 * with an invalid one, is rejected instead of being silently accepted.
 *
 * This policy is stricter than the Go decoder and is kept here on purpose,
 * separate from the generated types. Only current configuration keys and
 * _file settings are kept. Options and metadata of retained rules are unchanged.
 */
export function normalizeValidationRules(input: unknown): ValidationRulesInput {
	const parsed: unknown = typeof input === 'string' ? JSON.parse(input) : input;
	if (parsed !== null && parsed !== undefined && !isRecord(parsed)) {
		throw new Error('Validation rules must be a JSON object');
	}
	const result: [string, unknown][] = [];
	for (const [group, section] of Object.entries(parsed ?? {})) {
		const keys = currentRuleKeys.get(group);
		if (!isRecord(section)) {
			if (keys) result.push([group, section]);
			continue;
		}
		const currentSection = Object.fromEntries(Object.entries(section).filter(([key, value]) => {
			if (key === '_file') {
				parseRuleSeverity(value, `${group}.${key}`);
				return true;
			}
			if (!keys?.includes(key)) return false;
			if (!isRecord(value)) throw new Error(`${group}.${key}: expected a rule object`);
			if (!('severity' in value)) throw new Error(`${group}.${key}: missing severity`);
			parseRuleSeverity(value.severity, `${group}.${key}.severity`);
			return true;
		}));
		if (keys || Object.keys(currentSection).length > 0) result.push([group, currentSection]);
	}
	return structuredClone(Object.fromEntries(result)) as ValidationRulesInput;
}

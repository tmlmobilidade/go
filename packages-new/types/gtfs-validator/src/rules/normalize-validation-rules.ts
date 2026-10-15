import { isRecord } from './is-record.js';
import { ruleConfigKeys } from './rules-groups.js';
import { type ValidationRulesInput } from './rules-inputs.js';
import { parseRuleSeverity } from './severity.js';

/* * */

/**
 * Rebuild the configuration from the current validator's groups and keys.
 * A rule absent from the input stays absent so the Go validator can report
 * incomplete configuration before importing the GTFS.
 * By default, a present rule must have a valid severity. The editor can use
 * allowIncomplete to display and repair missing or invalid severities while
 * preserving the rule's other settings. Saving still uses the default checks.
 *
 * Completeness is checked by Go, separately from these editable settings.
 * Only current configuration keys (including supported _file settings) are
 * copied into a fresh object. Obsolete sections and rules are never retained.
 * Options and metadata of retained rules are unchanged.
 */
export function normalizeValidationRules(input: unknown, { allowIncomplete = false }: { allowIncomplete?: boolean } = {}): ValidationRulesInput {
	const parsed: unknown = typeof input === 'string' ? JSON.parse(input) : input;
	if (parsed !== null && parsed !== undefined && !isRecord(parsed)) {
		throw new Error('Validation rules must be a JSON object');
	}
	const result: [string, unknown][] = [];
	for (const [group, keys] of Object.entries(ruleConfigKeys)) {
		if (!parsed || !Object.hasOwn(parsed, group)) continue;
		const section: unknown = parsed[group];
		if (!isRecord(section)) {
			throw new Error(`${group}: expected a rules section object`);
		}
		const currentSection = Object.fromEntries(keys.filter(key => Object.hasOwn(section, key)).map((key) => {
			const value = section[key];
			if (key === '_file') {
				if (!allowIncomplete) parseRuleSeverity(value, `${group}.${key}`);
				return [key, value];
			}
			if (!isRecord(value)) throw new Error(`${group}.${key}: expected a rule object`);
			if (!allowIncomplete) {
				if (!('severity' in value)) throw new Error(`${group}.${key}: missing severity`);
				parseRuleSeverity(value.severity, `${group}.${key}.severity`);
			}
			return [key, value];
		}));
		result.push([group, currentSection]);
	}
	return structuredClone(Object.fromEntries(result)) as ValidationRulesInput;
}

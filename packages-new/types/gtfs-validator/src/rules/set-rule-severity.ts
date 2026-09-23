import { isRecord } from './is-record.js';
import { type RuleCatalogueEntry, type RuleSeverity, type ValidationRulesInput } from './rules.generated.js';

/* * */

/**
 * Return a copy of the rules with one catalogue entry set to a severity.
 * The value is written under the entry's stored config_key, which can differ
 * from its emitted id. Fixed notices are returned unchanged. A missing section
 * is created, and everything else already saved (other sections, other keys,
 * options, compare, depends_on and unknown metadata) is kept as it was.
 */
export function setRuleSeverity(rules: ValidationRulesInput, entry: RuleCatalogueEntry, severity: RuleSeverity): ValidationRulesInput {
	if (!entry.editable) return rules;
	const currentSection: unknown = rules[entry.group];
	const section = isRecord(currentSection) ? currentSection : {};
	const currentRule = section[entry.config_key];
	const value = entry.config_key === '_file' ? severity : { ...(isRecord(currentRule) ? currentRule : {}), severity };
	return { ...rules, [entry.group]: { ...section, [entry.config_key]: value } };
}

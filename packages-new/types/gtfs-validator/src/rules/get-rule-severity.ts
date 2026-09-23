import { isRecord } from './is-record.js';
import { type RuleCatalogueEntry, type RuleSeverity, type ValidationRulesInput } from './rules.generated.js';
import { isRuleSeverity } from './severity.js';

/* * */

/**
 * Resolve the severity the validator uses for a catalogue entry.
 * Fixed notices return their fixed severity. Editable rules return the saved
 * value, or Ignore when it is missing, which is the Go validator's default.
 */
export function getRuleSeverity(rules: ValidationRulesInput, entry: RuleCatalogueEntry): RuleSeverity {
	if (!entry.editable) return entry.severity ?? entry.severities?.[0] ?? 'error';
	const section: unknown = rules[entry.group];
	const value = isRecord(section) ? section[entry.config_key] : undefined;
	const severity = entry.config_key === '_file' ? value : (isRecord(value) ? value.severity : undefined);
	return isRuleSeverity(severity) ? severity : 'ignore';
}

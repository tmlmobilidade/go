import { isRecord } from './is-record.js';
import { type RuleCatalogueEntry } from './rules-catalogue.js';
import { type ValidationRulesInput } from './rules-inputs.js';
import { type RuleSeverity } from './rules-severities.js';
import { isRuleSeverity } from './severity.js';

/* * */

/**
 * Read the severity stored for a catalogue entry, or undefined when none is.
 * Unlike getRuleSeverity this does not fall back to the validator's Ignore
 * default, so the editor can tell a rule left unconfigured apart from one
 * deliberately set to Ignore. Fixed notices return their fixed severity.
 */
export function getSavedRuleSeverity(rules: ValidationRulesInput, entry: RuleCatalogueEntry): RuleSeverity | undefined {
	if (!entry.editable) return entry.severity ?? entry.severities?.[0] ?? 'error';
	const section: unknown = rules[entry.group];
	const value = isRecord(section) ? section[entry.config_key] : undefined;
	const severity = entry.config_key === '_file' ? value : (isRecord(value) ? value.severity : undefined);
	return isRuleSeverity(severity) ? severity : undefined;
}

/**
 * Resolve the severity the validator uses for a catalogue entry.
 * Fixed notices return their fixed severity. Editable rules return the saved
 * value, or Ignore when it is missing, which is the Go validator's default.
 */
export function getRuleSeverity(rules: ValidationRulesInput, entry: RuleCatalogueEntry): RuleSeverity {
	return getSavedRuleSeverity(rules, entry) ?? 'ignore';
}

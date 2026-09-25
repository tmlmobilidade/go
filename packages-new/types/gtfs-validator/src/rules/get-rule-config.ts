import { isRecord } from './is-record.js';
import { type RuleCatalogueEntry } from './rules-catalogue.js';
import { type RuleConfigInput, type ValidationRulesInput } from './rules-inputs.js';

/* * */

/** Read the saved configuration of an editable rule, excluding _file settings. */
export function getRuleConfig(rules: ValidationRulesInput, entry: RuleCatalogueEntry): RuleConfigInput | undefined {
	if (!entry.editable || entry.config_key === '_file') return undefined;
	const section: unknown = rules[entry.group];
	const value = isRecord(section) ? section[entry.config_key] : undefined;
	return isRecord(value) ? value as RuleConfigInput : undefined;
}

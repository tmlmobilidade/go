import { getRuleConfig } from './get-rule-config.js';
import { getSavedRuleSeverity } from './get-rule-severity.js';
import { type RuleCatalogueEntry } from './rules-catalogue.js';
import { type RuleConfigInput, type ValidationRulesInput } from './rules-inputs.js';

/* * */

/**
 * Update optional settings without changing severity or other rule metadata.
 * Null removes a setting, restoring the validator's default. A severity must
 * be configured first, so adding settings never silently enables a rule.
 */
export function setRuleConfig(rules: ValidationRulesInput, entry: RuleCatalogueEntry, settings: Pick<RuleConfigInput, 'compare' | 'options'>): ValidationRulesInput {
	if (!entry.editable || getSavedRuleSeverity(rules, entry) === undefined) return rules;
	const currentRule = getRuleConfig(rules, entry);
	if (!currentRule) return rules;
	const value = Object.fromEntries(Object.entries({ ...currentRule, ...settings }).filter(([key, value]) => {
		return (key !== 'compare' && key !== 'options') || value != null;
	}));
	return { ...rules, [entry.group]: { ...rules[entry.group], [entry.config_key]: structuredClone(value) } };
}

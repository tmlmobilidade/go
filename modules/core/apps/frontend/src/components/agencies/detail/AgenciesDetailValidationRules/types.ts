import { type GtfsValidationRule, type GtfsValidationRuleModifier, type GtfsValidationRuleSeverity, type GtfsValidatorRuleId } from '@tmlmobilidade/go-types-gtfs-validator';

/* * */

interface LegacyModifiers {
	compare?: Extract<GtfsValidationRuleModifier, { type: 'compare' }>['values']
	options?: Extract<GtfsValidationRuleModifier, { type: 'options' }>['values']
}

// Legacy settings remain editable until the user chooses a valid configuration.
export type AgenciesDetailValidationRule = LegacyModifiers & Omit<GtfsValidationRule, 'depends_on' | 'severity'> & Partial<Pick<GtfsValidationRule, 'depends_on' | 'severity'>>;

export interface AgenciesDetailValidationRuleEntry {
	dependsOn: GtfsValidatorRuleId[]
	ruleId: GtfsValidatorRuleId
	severity?: GtfsValidationRuleSeverity
}

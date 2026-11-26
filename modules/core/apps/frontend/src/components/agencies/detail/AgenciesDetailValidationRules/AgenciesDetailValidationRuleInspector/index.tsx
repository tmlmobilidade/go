'use client';

import { CloseButton, Section } from '@tmlmobilidade/ui';

import { AgenciesDetailValidationRuleDependencies } from '../AgenciesDetailValidationRuleDependencies';
import { AgenciesDetailValidationRuleModifier } from '../AgenciesDetailValidationRuleModifier';
import { useAgenciesDetailValidationRulesContext } from '../AgenciesDetailValidationRules.context';
import { AgenciesDetailValidationRuleSeverity } from '../AgenciesDetailValidationRuleSeverity';

/* * */

export function AgenciesDetailValidationRuleInspector() {
	//

	//
	// A. Setup variables

	const agenciesDetailValidationRulesContext = useAgenciesDetailValidationRulesContext();

	//
	// B. Render components

	if (!agenciesDetailValidationRulesContext.data.selectedEntry) return null;

	return (
		<Section key={agenciesDetailValidationRulesContext.data.selectedEntry.ruleId} gap="md" padding="none">
			<CloseButton onClick={() => agenciesDetailValidationRulesContext.actions.selectRule(undefined)} type="close" />
			<AgenciesDetailValidationRuleSeverity />
			<AgenciesDetailValidationRuleDependencies />
			<AgenciesDetailValidationRuleModifier />
		</Section>
	);
}

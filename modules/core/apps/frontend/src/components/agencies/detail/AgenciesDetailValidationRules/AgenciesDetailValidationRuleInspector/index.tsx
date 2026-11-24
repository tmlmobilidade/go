'use client';

import { Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { AgenciesDetailValidationRuleDependencies } from '../AgenciesDetailValidationRuleDependencies';
import { AgenciesDetailValidationRuleModifier } from '../AgenciesDetailValidationRuleModifier';
import { useAgenciesDetailValidationRulesContext } from '../AgenciesDetailValidationRules.context';
import { AgenciesDetailValidationRuleSeverity } from '../AgenciesDetailValidationRuleSeverity';

/* * */

export function AgenciesDetailValidationRuleInspector() {
	//

	//
	// A. Setup variables

	const { data: { selectedEntry } } = useAgenciesDetailValidationRulesContext();

	//
	// B. Render components

	if (!selectedEntry) return null;

	return (
		<Section key={selectedEntry.ruleId} gap="md" padding="none">
			<h3 className={styles.rule}>{selectedEntry.ruleId}</h3>
			<AgenciesDetailValidationRuleSeverity />
			<AgenciesDetailValidationRuleDependencies />
			<AgenciesDetailValidationRuleModifier />
		</Section>
	);
}

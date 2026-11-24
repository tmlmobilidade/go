'use client';

import { GtfsValidatorRuleIdSchema, GtfsValidatorRuleIdValues } from '@tmlmobilidade/go-types-gtfs-validator';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailValidationRulesContext } from '../AgenciesDetailValidationRules.context';

/* * */

export function AgenciesDetailValidationRuleDependencies() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, data: { selectedEntry, selectedRule }, flags } = useAgenciesDetailValidationRulesContext();
	const ruleId = selectedEntry?.ruleId;
	const dependencies = selectedRule?.depends_on ?? [];
	const options = GtfsValidatorRuleIdValues.filter(id => id !== ruleId);

	//
	// B. Handle actions

	const handleChange = (value: string[]) => {
		if (!ruleId) return;
		const dependsOn = GtfsValidatorRuleIdSchema.array().parse(value);
		actions.updateRule(ruleId, rule => rule?.severity && { ...rule, depends_on: dependsOn, severity: rule.severity });
	};

	//
	// C. Render components

	return (
		<MultiSelect
			data={options}
			label={t('agencies:detail.AgenciesDetailValidationRuleDependencies.label')}
			onChange={handleChange}
			placeholder={dependencies.length ? undefined : t('agencies:detail.AgenciesDetailValidationRuleDependencies.placeholder')}
			readOnly={!flags.can_edit || !selectedEntry?.severity}
			size="sm"
			value={dependencies}
			w="100%"
		/>
	);
}

'use client';

import { GtfsValidatorRuleSeveritySchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { Select } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailValidationRulesContext } from '../AgenciesDetailValidationRules.context';

/* * */

export function AgenciesDetailValidationRuleSeverity() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, data: { selectedEntry }, filters, flags } = useAgenciesDetailValidationRulesContext();

	//
	// B. Handle actions

	const handleChange = (value: null | string) => {
		const severity = GtfsValidatorRuleSeveritySchema.safeParse(value);
		if (!selectedEntry || !severity.success) return;
		const { ruleId } = selectedEntry;
		actions.updateRule(ruleId, rule => ({ ...rule, depends_on: rule?.depends_on ?? [], rule_id: ruleId, severity: severity.data }));
	};

	//
	// C. Render components

	return (
		<Select
			clearable={false}
			data={filters.configuredSeverityOptions}
			label={t('agencies:detail.AgenciesDetailValidationRuleSeverity.label')}
			onChange={handleChange}
			placeholder={filters.getSeverityLabel('unconfigured')}
			readOnly={!flags.can_edit}
			searchable={false}
			size="sm"
			value={selectedEntry?.severity ?? null}
			w="100%"
		/>
	);
}

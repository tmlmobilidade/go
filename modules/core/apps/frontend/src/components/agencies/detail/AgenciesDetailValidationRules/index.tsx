'use client';

import { type GtfsValidatorRulesDraft } from '@tmlmobilidade/go-types-gtfs-validator';
import { Collapsible, GtfsValidationRulesEditor, Section, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';
import { getAgenciesDetailValidationRules } from '../get-agencies-detail-validation-rules';

export function AgenciesDetailValidationRules() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useAgenciesDetailFormContext();
	const validationRules = useStandardFormWatch({ control: form.control, name: 'plans.validation_rules' }) ?? {};

	//
	// B. Handle actions

	const handleChange = (rules: GtfsValidatorRulesDraft) => {
		if (!capabilities.editEnabled) return;
		form.setValue('plans.validation_rules', getAgenciesDetailValidationRules(rules), { shouldDirty: true, shouldValidate: true });
	};

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.ValidationRules.description')}
			title={t('default:agencies.detail.ValidationRules.title')}
		>
			<Section gap="lg">
				<GtfsValidationRulesEditor onChange={handleChange} readOnly={!capabilities.editEnabled} rules={validationRules} />
			</Section>
		</Collapsible>
	);
}

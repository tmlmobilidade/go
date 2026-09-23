'use client';

import { type ValidationRulesInput } from '@tmlmobilidade/go-types-gtfs-validator';
import { Collapsible, ErrorDisplay, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';
import { AgenciesDetailValidationRulesTable } from '../AgenciesDetailValidationRulesTable';

export function AgenciesDetailValidationRules() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form, validationRules, validationRulesError } = useAgenciesDetailFormContext();

	//
	// B. Handle actions

	const handleChange = (rules: ValidationRulesInput) => {
		form.setValue('plans.validation_rules', rules, { shouldDirty: true });
	};

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.ValidationRules.description')}
			title={t('default:agencies.detail.ValidationRules.title')}
		>
			<Section gap="lg">
				{validationRulesError && <ErrorDisplay message={`${t('default:agencies.detail.ValidationRules.invalid')} ${validationRulesError}`} />}
				{validationRules && (
					<AgenciesDetailValidationRulesTable onChange={handleChange} readOnly={!capabilities.editEnabled} rules={validationRules} />
				)}
			</Section>
		</Collapsible>
	);
}

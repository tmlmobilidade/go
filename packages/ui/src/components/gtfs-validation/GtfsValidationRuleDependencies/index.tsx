'use client';

import { GtfsValidatorRuleIdSchema, GtfsValidatorRuleIdValues } from '@tmlmobilidade/go-types-gtfs-validator';
import { useTranslation } from 'react-i18next';

import { MultiSelect } from '../../inputs/MultiSelect';
import { GtfsValidationRuleSettingCard } from '../GtfsValidationRuleSettingCard';
import { type GtfsValidationRuleSeverityProps } from '../types';

/* * */

export function GtfsValidationRuleDependencies({ onChange, readOnly, rule, rules }: GtfsValidationRuleSeverityProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const config = rules[rule];
	const options = GtfsValidatorRuleIdValues.filter(id => id !== rule);

	//
	// B. Render components

	return (
		<GtfsValidationRuleSettingCard
			description={t('shared:components.gtfsValidationRules.dependencies.description')}
			removeLabel={t('shared:components.gtfsValidationRules.settings.remove')}
			title={t('shared:components.gtfsValidationRules.dependencies.label')}
		>
			<MultiSelect
				aria-label={`${rule}: ${t('shared:components.gtfsValidationRules.dependencies.label')}`}
				data={options}
				placeholder={t('shared:components.gtfsValidationRules.dependencies.placeholder')}
				readOnly={readOnly}
				size="xs"
				value={config?.depends_on ?? []}
				onChange={(value) => {
					if (readOnly || !config?.severity) return;
					onChange({ ...rules, [rule]: { ...config, depends_on: GtfsValidatorRuleIdSchema.array().parse(value) } });
				}}
			/>
		</GtfsValidationRuleSettingCard>
	);
}

'use client';

import { KeyValueListInput, Label, Section, Select, TagsInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useAgenciesDetailValidationRulesContext } from '../AgenciesDetailValidationRules.context';
import { useAgenciesDetailValidationRuleModifier } from './use-agencies-detail-validation-rule-modifier';

/* * */

export function AgenciesDetailValidationRuleModifier() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: { selectedEntry } } = useAgenciesDetailValidationRulesContext();
	const { canEdit, hasConflictingModifiers, isReplacingModifier, modifier, setModifier, setType } = useAgenciesDetailValidationRuleModifier();
	const optionsLabel = t('agencies:detail.AgenciesDetailValidationRuleModifier.options');
	const options = [
		{ disabled: hasConflictingModifiers, label: t('agencies:detail.AgenciesDetailValidationRuleModifier.none'), value: 'none' },
		{ label: optionsLabel, value: 'options' },
		{ label: t('agencies:detail.AgenciesDetailValidationRuleModifier.compare'), value: 'compare' },
	];

	//
	// B. Render components

	return (
		<div className={styles.modifier}>
			<Section gap="sm" padding="none">
				<Select
					clearable={false}
					data={options}
					description={hasConflictingModifiers ? t('agencies:detail.AgenciesDetailValidationRuleModifier.legacy_modifiers') : undefined}
					label={t('agencies:detail.AgenciesDetailValidationRuleModifier.label')}
					onChange={setType}
					placeholder={t('agencies:detail.AgenciesDetailValidationRuleModifier.choose')}
					readOnly={!canEdit}
					searchable={false}
					size="sm"
					value={modifier?.type ?? (hasConflictingModifiers ? null : 'none')}
					w="100%"
				/>
				{isReplacingModifier && <Label size="sm" variant="muted">{t('agencies:detail.AgenciesDetailValidationRuleModifier.pending')}</Label>}
				{modifier && (
					<div className={styles.values}>
						{modifier.type === 'options' ? (
							<TagsInput
								aria-label={optionsLabel}
								onChange={values => setModifier({ type: 'options', values })}
								placeholder={t('agencies:detail.AgenciesDetailValidationRuleModifier.options_placeholder')}
								readOnly={!canEdit}
								size="sm"
								splitChars={[' ', ',', ';', '|']}
								value={modifier.values}
								w="100%"
							/>
						) : (
							<KeyValueListInput
								ariaLabel={selectedEntry?.ruleId}
								readOnly={!canEdit}
								value={modifier.values}
								valueLabel={t('agencies:detail.AgenciesDetailValidationRuleModifier.expected_value')}
								onChange={pairs => setModifier({
									type: 'compare',
									values: pairs.map(({ key, value }) => ({ key: key ?? '', value: value ?? '' })),
								})}
							/>
						)}
					</div>
				)}
			</Section>
		</div>
	);
}

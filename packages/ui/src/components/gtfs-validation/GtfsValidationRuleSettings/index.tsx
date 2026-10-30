'use client';

import { IconPlus } from '@tabler/icons-react';
import { type GtfsValidatiorRule, type GtfsValidatorRuleId } from '@tmlmobilidade/go-types-gtfs-validator';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Button } from '../../../buttons/Button';
import { KeyValueListInput } from '../../inputs/KeyValueListInput';
import { TagsInput } from '../../inputs/TagsInput';
import { Section } from '../../layout/Section';
import { GtfsValidationRuleDependencies } from '../GtfsValidationRuleDependencies';
import { GtfsValidationRuleSettingCard } from '../GtfsValidationRuleSettingCard';
import { type GtfsValidationRulesEditorProps } from '../types';

/* * */

interface GtfsValidationRuleSettingsProps extends GtfsValidationRulesEditorProps {
	rule: GtfsValidatorRuleId
}

/* * */

// Whether the rule has settings to show; read-only rules only show saved ones.
export function hasRuleSettings(rules: GtfsValidationRulesEditorProps['rules'], rule: GtfsValidatorRuleId, readOnly: boolean) {
	if (rules[rule]?.severity === undefined) return false;
	if (!readOnly) return true;
	const config = rules[rule];
	return !!config?.depends_on?.length || Array.isArray(config?.options) || Array.isArray(config?.compare);
}

/* * */

export function GtfsValidationRuleSettings({ onChange, readOnly, rule, rules }: GtfsValidationRuleSettingsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const config = rules[rule];
	const hasSeverity = config?.severity !== undefined;

	const [opened, setOpened] = useState({ compare: false, options: false });
	const showOptions = opened.options || Array.isArray(config?.options);
	const showCompare = opened.compare || Array.isArray(config?.compare);

	//
	// B. Handle actions

	const handleChange = (settings: Pick<GtfsValidatiorRule, 'compare' | 'options'>) => {
		if (readOnly || !hasSeverity) return;
		onChange({ ...rules, [rule]: { depends_on: [], ...config, ...settings } });
	};

	const handleAdd = (setting: 'compare' | 'options') => {
		if (readOnly || !hasSeverity) return;
		setOpened(current => ({ ...current, [setting]: true }));
	};

	const handleRemove = (setting: 'compare' | 'options') => {
		if (readOnly) return;
		setOpened(current => ({ ...current, [setting]: false }));
		handleChange({ [setting]: undefined });
	};

	//
	// C. Render components

	if (!hasRuleSettings(rules, rule, readOnly)) return null;

	return (
		<Section gap="sm" padding="none">
			<GtfsValidationRuleDependencies onChange={onChange} readOnly={readOnly} rule={rule} rules={rules} />
			{(showOptions || showCompare) && (
				<div className={styles.cards}>
					{showOptions && (
						<GtfsValidationRuleSettingCard
							description={t('shared:components.gtfsValidationRules.options.description')}
							onRemove={readOnly ? undefined : () => handleRemove('options')}
							removeLabel={t('shared:components.gtfsValidationRules.settings.remove')}
							title={t('shared:components.gtfsValidationRules.options.label')}
						>
							<TagsInput
								aria-label={`${rule}: ${t('shared:components.gtfsValidationRules.options.label')}`}
								onChange={options => handleChange({ options })}
								placeholder={t('shared:components.gtfsValidationRules.options.placeholder')}
								readOnly={readOnly}
								size="xs"
								splitChars={[' ', ',', ';', '|']}
								value={config?.options ?? []}
								w="100%"
							/>
						</GtfsValidationRuleSettingCard>
					)}
					{showCompare && (
						<GtfsValidationRuleSettingCard
							description={t('shared:components.gtfsValidationRules.compare.description')}
							onRemove={readOnly ? undefined : () => handleRemove('compare')}
							removeLabel={t('shared:components.gtfsValidationRules.settings.remove')}
							title={t('shared:components.gtfsValidationRules.compare.label')}
						>
							<KeyValueListInput
								ariaLabel={rule}
								onChange={compare => handleChange({ compare: compare.map(({ key, value }) => ({ key: key ?? '', value: value ?? '' })) })}
								readOnly={readOnly}
								value={config?.compare ?? []}
								valueLabel={t('shared:components.gtfsValidationRules.compare.value')}
							/>
						</GtfsValidationRuleSettingCard>
					)}
				</div>
			)}
			{!readOnly && (!showOptions || !showCompare) && (
				<div className={styles.actions}>
					{!showOptions && <Button icon={<IconPlus size={14} />} label={t('shared:components.gtfsValidationRules.options.label')} onClick={() => handleAdd('options')} size="xs" variant="secondary" />}
					{!showCompare && <Button icon={<IconPlus size={14} />} label={t('shared:components.gtfsValidationRules.compare.label')} onClick={() => handleAdd('compare')} size="xs" variant="secondary" />}
				</div>
			)}
		</Section>
	);
}

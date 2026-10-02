'use client';

import { getSavedRuleSeverity, ruleSeverities, type RuleSeverity, setRuleSeverity } from '@tmlmobilidade/go-types-gtfs-validator';
import { useTranslation } from 'react-i18next';

import { Label } from '../../display/Label';
import { SegmentedControl } from '../../inputs/SegmentedControl';
import { type GtfsValidationRuleSeverityProps } from '../types';

/* * */

export function GtfsValidationRuleSeverity({ onChange, readOnly, rule, rules }: GtfsValidationRuleSeverityProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const options = ruleSeverities.map(value => ({ label: t(`shared:components.gtfsValidationRules.severities.${value}`), value }));

	//
	// B. Render components

	if (!rule.editable) {
		return <Label>{(rule.severities ?? [rule.severity]).map(value => t(`shared:components.gtfsValidationRules.severities.${value}`)).join(' / ')}</Label>;
	}

	// Missing severity has no segment selected, unlike a deliberate Ignore.
	return (
		<SegmentedControl
			aria-label={`${rule.id}: ${t('shared:components.gtfsValidationRules.severity')}`}
			data={options}
			onChange={value => onChange(setRuleSeverity(rules, rule, value as RuleSeverity))}
			readOnly={readOnly}
			size="xs"
			value={getSavedRuleSeverity(rules, rule) ?? ''}
		/>
	);
}

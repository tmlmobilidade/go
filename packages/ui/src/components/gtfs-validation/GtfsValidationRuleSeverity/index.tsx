'use client';

import { SeverityStatusSchema, SeverityStatusValues } from '@tmlmobilidade/go-types-shared';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { SegmentedControl } from '../../inputs/SegmentedControl';
import { type GtfsValidationRuleSeverityProps } from '../types';

/* * */

export function GtfsValidationRuleSeverity({ onChange, readOnly, rule, rules }: GtfsValidationRuleSeverityProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const options = SeverityStatusValues.map(value => ({ label: t(`shared:components.gtfsValidationRules.severities.${value}`), value }));
	const severity = rules[rule]?.severity;

	//
	// B. Render components

	// Missing severity has no segment selected, unlike a deliberate Ignore.
	return (
		<SegmentedControl
			aria-label={`${rule}: ${t('shared:components.gtfsValidationRules.severity')}`}
			classNames={{ label: styles.option, root: styles.root }}
			data={options}
			description={severity === undefined ? t('shared:components.gtfsValidationRules.unconfigured.description') : undefined}
			readOnly={readOnly}
			size="xs"
			value={severity ?? ''}
			onChange={(value) => {
				if (readOnly) return;
				onChange({ ...rules, [rule]: { depends_on: [], ...rules[rule], severity: SeverityStatusSchema.parse(value) } });
			}}
			fullWidth
		/>
	);
}

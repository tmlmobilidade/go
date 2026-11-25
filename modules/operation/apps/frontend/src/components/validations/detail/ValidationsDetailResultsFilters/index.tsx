'use client';

import { type ValidationsDetailResultSeverity } from '@/components/validations/detail/get-validations-detail-results';
import { useValidationsDetailResultsContext } from '@/components/validations/detail/ValidationsDetailResults.context';
import { Section, SeverityTag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailResultsFilters() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions: { toggleSeverity }, data: { totals }, filters } = useValidationsDetailResultsContext();

	//
	// B. Transform data

	const options: { label: string, severity: ValidationsDetailResultSeverity }[] = [
		{ label: t('validations:detail.ValidationsDetailResultsFilters.error', '', { count: totals.errors }), severity: 'error' },
		{ label: t('validations:detail.ValidationsDetailResultsFilters.warning', '', { count: totals.warnings }), severity: 'warning' },
		{ label: t('validations:detail.ValidationsDetailResultsFilters.info', '', { count: totals.infos }), severity: 'info' },
	];

	//
	// C. Render components

	return (
		<Section flexDirection="row" gap="md">
			{options.map(({ label, severity }) => (
				<SeverityTag
					key={severity}
					dimmed={filters.severity !== null && filters.severity !== severity}
					label={label}
					onClick={() => toggleSeverity(severity)}
					selected={filters.severity === severity}
					severity={severity}
				/>
			))}
		</Section>
	);

	//
}

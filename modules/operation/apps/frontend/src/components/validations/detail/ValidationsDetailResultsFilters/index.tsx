'use client';

import { type ValidationsDetailResultSeverity } from '@/components/validations/detail/get-validations-detail-results';
import { useValidationsDetailResultsContext } from '@/components/validations/detail/ValidationsDetailResults.context';
import { SearchInput, SeverityTag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function ValidationsDetailResultsFilters() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, data: { totals }, filters } = useValidationsDetailResultsContext();
	const searchLabel = t('validations:detail.ValidationsDetailResultsFilters.search_placeholder');

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
		<div className={styles.toolbar}>
			<div className={styles.severities}>
				{options.map(({ label, severity }) => (
					<SeverityTag
						key={severity}
						dimmed={filters.severity !== null && filters.severity !== severity}
						label={label}
						onClick={() => actions.toggleSeverity(severity)}
						selected={filters.severity === severity}
						severity={severity}
					/>
				))}
			</div>
			<SearchInput
				aria-label={searchLabel}
				onChange={actions.search}
				placeholder={searchLabel}
				value={filters.search}
			/>
		</div>
	);

	//
}

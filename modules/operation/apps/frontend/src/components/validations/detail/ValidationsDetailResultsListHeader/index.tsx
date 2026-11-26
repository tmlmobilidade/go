'use client';

import { SearchInput, SeverityTag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { type ValidationsDetailResultSeverity } from '../get-validations-detail-results';
import { useGtfsValidationsDetailResultsContext } from '../GtfsValidationsDetailResults.context';

/* * */

export function ValidationsDetailResultsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, data: { totals }, filters } = useGtfsValidationsDetailResultsContext();
	const searchLabel = t('gtfs_validations:detail.ValidationsDetailResultsListHeader.search_placeholder');

	//
	// B. Transform data

	const severityOptions: { label: string, severity: ValidationsDetailResultSeverity }[] = [
		{ label: t('gtfs_validations:detail.ValidationsDetailResultsListHeader.error', '', { count: totals.errors }), severity: 'error' },
		{ label: t('gtfs_validations:detail.ValidationsDetailResultsListHeader.warning', '', { count: totals.warnings }), severity: 'warning' },
		{ label: t('gtfs_validations:detail.ValidationsDetailResultsListHeader.info', '', { count: totals.infos }), severity: 'info' },
	];

	//
	// C. Render components

	return (
		<Toolbar>
			<div className={styles.severities}>
				{severityOptions.map(({ label, severity }) => (
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
				w="100%"
			/>
		</Toolbar>
	);
}

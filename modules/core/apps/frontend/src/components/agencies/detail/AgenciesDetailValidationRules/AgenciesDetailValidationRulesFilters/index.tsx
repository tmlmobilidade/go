'use client';

import { SearchField, Select } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useAgenciesDetailValidationRulesContext } from '../AgenciesDetailValidationRules.context';

/* * */

export function AgenciesDetailValidationRulesFilters() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, filters } = useAgenciesDetailValidationRulesContext();
	const severityLabel = t('agencies:detail.AgenciesDetailValidationRulesFilters.severity');

	//
	// B. Render components

	return (
		<div className={styles.filters}>
			<div className={styles.search}>
				<SearchField
					onChange={actions.setSearch}
					placeholder={t('agencies:detail.AgenciesDetailValidationRulesFilters.search')}
					value={filters.search.value}
				/>
			</div>
			<Select
				aria-label={severityLabel}
				className={styles.severity}
				data={filters.severityOptions}
				onChange={actions.setSeverityFilter}
				placeholder={severityLabel}
				searchable={false}
				size="sm"
				value={filters.severity}
			/>
		</div>
	);
}

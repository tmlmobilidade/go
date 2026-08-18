'use client';

/* * */

import { FilterMenu } from '@/components/shell/FilterMenu';
import { OperatorFilter } from '@/components/shell/OperatorFilter';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { IconArrowsExchange, IconCalendar, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function FilterBar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const filtersContext = usePerformanceFiltersContext();

	//
	// B. Transform data

	const getLabel = (options: { label: string, value: string }[], value: string) => options.find(option => option.value === value)?.label ?? value;

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<div className={styles.scrollArea}>
				<FilterMenu
					icon={IconCalendar}
					label={t('filters.date.label')}
					onChange={filtersContext.filters.date.set}
					options={filtersContext.data.dateOptions}
					value={filtersContext.filters.date.value}
					valueLabel={getLabel(filtersContext.data.dateOptions, filtersContext.filters.date.value)}
				/>
				<FilterMenu
					icon={IconArrowsExchange}
					label={t('filters.comparison.label')}
					onChange={filtersContext.filters.comparison.set}
					options={filtersContext.data.comparisonOptions}
					value={filtersContext.filters.comparison.value}
					valueLabel={getLabel(filtersContext.data.comparisonOptions, filtersContext.filters.comparison.value)}
				/>
				<OperatorFilter />
			</div>
			<button aria-label={t('filters.refresh')} className={styles.refresh} type="button">
				<IconRefresh aria-hidden="true" size={19} />
			</button>
		</div>
	);

	//
}

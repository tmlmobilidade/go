'use client';

/* * */

import { DemoDataControl } from '@/components/shell/DemoDataControl';
import { FilterMenu } from '@/components/shell/FilterMenu';
import { OperatorFilter } from '@/components/shell/OperatorFilter';
import { PeriodFilter } from '@/components/shell/PeriodFilter';
import { useDemoDataContext } from '@/contexts/DemoData.context';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { IconArrowsExchange, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import styles from './styles.module.css';

/* * */

const MINIMUM_REFRESH_DURATION = 650;

function wait(duration: number) {
	return new Promise(resolve => setTimeout(resolve, duration));
}

/* * */

export function FilterBar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const { mutate } = useSWRConfig();
	const demoDataContext = useDemoDataContext();
	const filtersContext = usePerformanceFiltersContext();
	const [isRefreshing, setIsRefreshing] = useState(false);

	//
	// B. Transform data

	const getLabel = (options: { label: string, value: string }[], value: string) => options.find(option => option.value === value)?.label ?? value;
	const comparisonLabel = getLabel(filtersContext.data.comparisonOptions, filtersContext.filters.comparison.value);

	//
	// C. Handle actions

	const handleRefresh = async () => {
		if (isRefreshing) return;
		setIsRefreshing(true);
		if (demoDataContext.flags.is_enabled) demoDataContext.actions.refresh();

		try {
			await Promise.all([
				mutate(key => typeof key === 'string'),
				wait(MINIMUM_REFRESH_DURATION),
			]);
		} finally {
			setIsRefreshing(false);
		}
	};

	//
	// D. Render components

	return (
		<div className={styles.root}>
			<div className={styles.scrollArea}>
				<DemoDataControl />
				<PeriodFilter
					onChange={filtersContext.actions.setPeriod}
					value={filtersContext.filters.period.value}
				/>
				<FilterMenu
					icon={IconArrowsExchange}
					label={t('filters.comparison.label')}
					onChange={filtersContext.filters.comparison.set}
					options={filtersContext.data.comparisonOptions}
					value={filtersContext.filters.comparison.value}
					valueLabel={`${comparisonLabel} · ${filtersContext.data.comparisonContextLabel}`}
				/>
				<OperatorFilter />
			</div>
			<button
				aria-busy={isRefreshing}
				aria-label={t('filters.refresh')}
				className={styles.refresh}
				data-refreshing={isRefreshing}
				disabled={isRefreshing}
				onClick={() => void handleRefresh()}
				type="button"
			>
				<IconRefresh aria-hidden="true" size={19} />
			</button>
		</div>
	);

	//
}

/* * */

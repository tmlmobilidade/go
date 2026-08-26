'use client';

/* * */

import { useDemoDataContext } from '@/contexts/DemoData.context';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { useCallback } from 'react';

/* * */

export function usePerformanceFilterHref() {
	const filtersContext = usePerformanceFiltersContext();
	const demoDataContext = useDemoDataContext();

	return useCallback((pathname: string) => {
		const query = new URLSearchParams();
		const period = filtersContext.filters.period.value;
		const selectedOperators = filtersContext.filters.operator.values;
		const allOperators = filtersContext.data.operatorOptions.map(option => option.value);

		query.set('period', period.preset);
		query.set('comparison', filtersContext.filters.comparison.value);
		if (period.preset === 'custom' && period.startDate && period.endDate) {
			query.set('start_date', period.startDate);
			query.set('end_date', period.endDate);
		}
		if (selectedOperators.length !== allOperators.length || !allOperators.every(id => selectedOperators.includes(id))) {
			query.set('agency_ids', [...selectedOperators].sort().join(','));
		}
		if (demoDataContext.flags.is_enabled) query.set('demo', 'true');

		return `${pathname}?${query.toString()}`;
	}, [demoDataContext.flags.is_enabled, filtersContext.data.operatorOptions, filtersContext.filters.comparison.value, filtersContext.filters.operator.values, filtersContext.filters.period.value]);
}

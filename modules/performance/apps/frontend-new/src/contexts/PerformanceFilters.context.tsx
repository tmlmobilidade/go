'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { usePerformancePeriodFilters } from '@/hooks/usePerformancePeriodFilters';
import { type PerformanceComparison, type PerformancePeriodSelection, type PerformanceScreen } from '@/utils/performance-periods';
import { useFilterStateList } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

interface FilterOption {
	description?: string
	label: string
	value: string
}

interface PerformanceFiltersContextState {
	actions: {
		setOperators: (operatorIds: string[]) => void
		setPeriod: (selection: PerformancePeriodSelection) => void
	}
	data: {
		comparisonContextLabel: string
		comparisonOptions: FilterOption[]
		operatorOptions: FilterOption[]
		screen: PerformanceScreen
	}
	filters: {
		comparison: { set: (value: string) => void, value: PerformanceComparison }
		operator: { values: string[] }
		period: { set: (selection: PerformancePeriodSelection) => void, value: PerformancePeriodSelection }
	}
}

/* * */

const PerformanceFiltersContext = createContext<PerformanceFiltersContextState | undefined>(undefined);

/* * */

export function usePerformanceFiltersContext() {
	const context = useContext(PerformanceFiltersContext);
	if (!context) {
		throw new Error('usePerformanceFiltersContext must be used within a PerformanceFiltersContextProvider');
	}
	return context;
}

/* * */

export function PerformanceFiltersContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const periodFilters = usePerformancePeriodFilters();

	//
	// B. Transform data

	const operatorOptions = useMemo<FilterOption[]>(() => agenciesContext.data.agencies.map(agency => ({
		label: agency.public_name,
		value: agency._id,
	})), [agenciesContext.data.agencies]);
	const allOperatorIds = useMemo(() => operatorOptions.map(item => item.value), [operatorOptions]);
	const operatorFilter = useFilterStateList('agency_ids', allOperatorIds, operatorOptions);
	//
	// C. Handle actions

	const setOperatorsAction = (operatorIds: string[]) => {
		if (operatorIds.length === 0) return;
		operatorFilter.set(operatorIds);
	};

	//
	// D. Render components

	return (
		<PerformanceFiltersContext.Provider
			value={{
				actions: { setOperators: setOperatorsAction, setPeriod: periodFilters.filters.period.set },
				data: { ...periodFilters.data, operatorOptions },
				filters: {
					comparison: periodFilters.filters.comparison,
					operator: { values: operatorFilter.value },
					period: periodFilters.filters.period,
				},
			}}
		>
			{children}
		</PerformanceFiltersContext.Provider>
	);

	//
}

/* * */

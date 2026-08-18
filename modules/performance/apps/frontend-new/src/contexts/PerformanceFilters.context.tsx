'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface FilterOption {
	description?: string
	label: string
	value: string
}

interface PerformanceFiltersContextState {
	actions: {
		setOperators: (operatorIds: string[]) => void
	}
	data: {
		comparisonOptions: FilterOption[]
		dateOptions: FilterOption[]
		operatorOptions: FilterOption[]
	}
	filters: {
		comparison: { set: (value: string) => void, value: string }
		date: { set: (value: string) => void, value: string }
		operator: { values: string[] }
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

	const { t } = useTranslation('default');
	const agenciesContext = useAgenciesContext();
	const [date, setDate] = useState('today');
	const [comparison, setComparison] = useState('equivalent-days');
	const [operators, setOperators] = useState<null | string[]>(null);

	//
	// B. Transform data

	const dateOptions = useMemo<FilterOption[]>(() => [
		{ label: t('filters.date.today'), value: 'today' },
		{ label: t('filters.date.yesterday'), value: 'yesterday' },
	], [t]);

	const comparisonOptions = useMemo<FilterOption[]>(() => [
		{ description: t('filters.comparison.equivalentDescription'), label: t('filters.comparison.equivalentDays'), value: 'equivalent-days' },
		{ label: t('filters.comparison.previousDay'), value: 'previous-day' },
		{ label: t('filters.comparison.previousWeek'), value: 'previous-week' },
	], [t]);

	const operatorOptions = useMemo<FilterOption[]>(() => agenciesContext.data.agencies.map(agency => ({
		label: agency.public_name,
		value: agency._id,
	})), [agenciesContext.data.agencies]);
	const selectedOperators = operators ?? operatorOptions.map(item => item.value);

	//
	// C. Handle actions

	const setOperatorsAction = (operatorIds: string[]) => {
		if (operatorIds.length === 0) return;

		const allIds = operatorOptions.map(item => item.value);
		if (operatorIds.length === allIds.length && allIds.every(id => operatorIds.includes(id))) {
			setOperators(null);
			return;
		}

		setOperators(operatorIds);
	};

	//
	// D. Render components

	return (
		<PerformanceFiltersContext.Provider
			value={{
				actions: { setOperators: setOperatorsAction },
				data: { comparisonOptions, dateOptions, operatorOptions },
				filters: {
					comparison: { set: setComparison, value: comparison },
					date: { set: setDate, value: date },
					operator: { values: selectedOperators },
				},
			}}
		>
			{children}
		</PerformanceFiltersContext.Provider>
	);

	//
}

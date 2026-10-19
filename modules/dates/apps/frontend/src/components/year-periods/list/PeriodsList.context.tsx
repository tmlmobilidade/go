'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-users-agencies-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, useFilterStateList, type UseFilterStateListReturnType, useFilterStateText, type UseFilterStateTextReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

/* * */

interface PeriodsListContextState {
	data: {
		filtered: YearPeriod[]
		raw: YearPeriod[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		search: UseFilterStateTextReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const PeriodsListContext = createContext<PeriodsListContextState | undefined>(undefined);

export const usePeriodsListContext = () => {
	const context = useContext(PeriodsListContext);
	if (!context) {
		throw new Error('usePeriodsListContext must be used within a PeriodsListContextProvider');
	}
	return context;
};

/* * */

export const PeriodsListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allPeriodsData, error: allPeriodsError, isLoading: allPeriodsLoading } = useSWR(API_ROUTES.dates.YEAR_PERIODS_LIST, {
		fetcher: async (url: string) => await fetchApiData<YearPeriod[]>({ url }),
	});

	const { ids: filteredAgencyIds, options: filteredAgencyOptions } = useAnnotationsAgenciesData();

	//
	// B. Setup filters

	const filterSearch = useFilterStateText('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);

	//
	// C. Transform data

	const searchResultsData = useSearch<YearPeriod>({
		accessors: ['_id', 'name', 'agency_ids'],
		data: allPeriodsData?.data ?? [],
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// Convert filter array to set for O(1) membership checks
		const agencySet = new Set(filterAgency.value);

		return searchResultsData
			.filter((item: YearPeriod) => {
				// Filter by agency - check if the period has ANY matching agency
				if (!item.agency_ids || item.agency_ids.length === 0) {
					return true; // Show periods with no agencies in all filters
				}
				// User can see period if they have access to at least ONE agency
				const hasMatchingAgency = item.agency_ids.some(agencyId => agencySet.has(agencyId));
				if (!hasMatchingAgency) return false;

				// Return true if all filters pass
				return true;
			});
	}, [searchResultsData, filterAgency.value]);

	//
	// D. Define context value

	const contextValue: PeriodsListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allPeriodsData?.data ?? [],
		},
		filters: {
			agency: filterAgency,
			search: filterSearch,
		},
		flags: {
			error: allPeriodsError,
			loading: allPeriodsLoading,
		},
	}), [
		allPeriodsError,
		allPeriodsLoading,
		filterResultsData,
		allPeriodsData,
		filterAgency,
		filterSearch,
	]);

	//
	// E. Render components

	return (
		<PeriodsListContext.Provider value={contextValue}>
			{children}
		</PeriodsListContext.Provider>
	);

	//
};

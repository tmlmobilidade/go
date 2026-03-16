'use client';

/* * */

import { type PeriodNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { PermissionCatalog, type YearPeriod } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

/* * */

interface PeriodsListContextState {
	data: {
		filtered: PeriodNormalized[]
		raw: YearPeriod[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
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

	const { data: allPeriodsData, error: allPeriodsError, isLoading: allPeriodsLoading } = useSWR<YearPeriod[], Error>(API_ROUTES.dates.YEAR_PERIODS_LIST);

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.year_periods.actions.read],
		scope: PermissionCatalog.all.year_periods.scope,
	});

	//
	// B. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);

	//
	// C. Transform data

	const normalizedPeriodsData: PeriodNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allPeriodsData) return [];
		// Normalize record fields
		return allPeriodsData.map((item) => {
			const agencyIds = item.agency_ids.join(', ');

			return {
				...item,
				agency_ids_normalized: normalizeString(agencyIds),
			};
		});
	}, [allPeriodsData]);

	const searchResultsData = useSearch<PeriodNormalized>({
		accessors: ['_id', 'name', 'agency_ids_normalized'],
		data: normalizedPeriodsData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// Convert filter array to set for O(1) membership checks
		const agencySet = new Set(filterAgency.value);

		return searchResultsData
			.filter((item: PeriodNormalized) => {
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
			raw: allPeriodsData ?? [],
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

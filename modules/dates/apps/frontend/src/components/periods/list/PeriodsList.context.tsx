'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Period, PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PeriodNormalized extends Period {
	agency_id_normalized: string
	id: string
}

/* * */

interface PeriodsListContextState {
	data: {
		filtered: PeriodNormalized[]
		raw: Period[]
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

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.read);

	const { data: allPeriodsData, error: allPeriodsError, isLoading: allPeriodsLoading } = useSWR<Period[], Error>(API_ROUTES.dates.PERIODS_LIST, { refreshInterval: 5000 });

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
			return {
				...item,
				agency_id_normalized: normalizeString(item.agency_id),
				id: item._id,
			};
		});
	}, [allPeriodsData]);

	const searchResultsData = useSearch<PeriodNormalized>({
		accessors: ['_id', 'name', 'agency_id_normalized'],
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
				// Filter by agency - check if the period's agency matches the filter
				if (!item.agency_id) {
					return true; // Show periods with no agency in all filters
				}
				const hasMatchingAgency = agencySet.has(item.agency_id);
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

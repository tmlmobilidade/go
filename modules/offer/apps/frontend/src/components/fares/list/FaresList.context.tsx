'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Fare, PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useMeContext, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface FaresListContextState {
	data: {
		filtered: Fare[]
		raw: Fare[]
	}
	filters: {
		agencies: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
	}
	flags: {
		canCreate: boolean
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const FaresListContext = createContext<FaresListContextState | undefined>(undefined);

export const useFaresListContext = () => {
	const context = useContext(FaresListContext);
	if (!context) {
		throw new Error('useFaresListContext must be used within a FaresListContextProvider');
	}
	return context;
};

/* * */

export const FaresListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.fares.actions.read],
		scope: PermissionCatalog.all.fares.scope,
	});

	//
	// B. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgencies = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);

	//
	// B. Fetch data

	const { data: allFaresData, error: allFaresError, isLoading: allFaresLoading } = useSWR<Fare[], Error>(API_ROUTES.offer.FARES_LIST, { refreshInterval: 5000 });

	//
	// C. Transform data

	const searchResultsData = useSearch<Fare>({
		accessors: ['_id', 'name', 'code', 'agency_ids'],
		data: allFaresData ?? [],
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgencies.value);

		return searchResultsData
			.filter((item: Fare) => {
				// Filter by agency - check if any of the annotation's agencies match the filter
				if (!item.agency_ids.some(agencyId => agencySet.has(agencyId))) return false;

				// Return true if all filters pass
				return true;
			})
			.sort((a, b) => {
				// Sort by created_at descending (newest first)
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
	}, [searchResultsData, filterAgencies]);

	const canCreatePermission = meContext.actions.hasPermission(PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.create);

	// D. Define context value
	const contextValue: FaresListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allFaresData ?? [],
		},
		filters: {
			agencies: filterAgencies,
			search: filterSearch,
		},
		flags: {
			canCreate: canCreatePermission,
			error: allFaresError,
			loading: allFaresLoading,
		},
	}), [allFaresError, allFaresLoading, searchResultsData, allFaresData, filterSearch, filterAgencies]);

	// E. Render components
	return (
		<FaresListContext.Provider value={contextValue}>
			{children}
		</FaresListContext.Provider>
	);
};

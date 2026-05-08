'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, type Typology } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useMeContext, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface TypologiesListContextState {
	data: {
		filtered: Typology[]
		raw: Typology[]
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

const TypologiesListContext = createContext<TypologiesListContextState | undefined>(undefined);

export const useTypologiesListContext = () => {
	const context = useContext(TypologiesListContext);
	if (!context) {
		throw new Error('useTypologiesListContext must be used within a TypologiesListContextProvider');
	}
	return context;
};

/* * */

export const TypologiesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.typologies.actions.read],
		scope: PermissionCatalog.all.typologies.scope,
	});

	//
	// B. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgencies = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);

	//
	// B. Fetch data

	const { data: allTypologiesData, error: allTypologiesError, isLoading: allTypologiesLoading } = useSWR<Typology[], Error>(API_ROUTES.offer.TYPOLOGIES_LIST);

	//
	// C. Transform data

	const searchResultsData = useSearch<Typology>({
		accessors: ['_id', 'name', 'code', 'agency_ids'],
		data: allTypologiesData ?? [],
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgencies.value);

		return searchResultsData
			.filter((item: Typology) => {
				// Filter by agency - check if any of the typology's agencies match the filter
				if (!item.agency_ids.some(agencyId => agencySet.has(agencyId))) return false;

				// Return true if all filters pass
				return true;
			})
			.sort((a, b) => {
				// Sort by created_at descending (newest first)
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
	}, [searchResultsData, filterAgencies]);

	const canCreatePermission = meContext.actions.hasPermission(PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.create);

	// D. Define context value
	const contextValue: TypologiesListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allTypologiesData ?? [],
		},
		filters: {
			agencies: filterAgencies,
			search: filterSearch,
		},
		flags: {
			canCreate: canCreatePermission,
			error: allTypologiesError,
			loading: allTypologiesLoading,
		},
	}), [allTypologiesError, allTypologiesLoading, searchResultsData, allTypologiesData, filterSearch, filterAgencies]);

	// E. Render components
	return (
		<TypologiesListContext.Provider value={contextValue}>
			{children}
		</TypologiesListContext.Provider>
	);
};

'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, Sam } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, useFilterStateString, type UseFilterStateListReturnType, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';

/* * */

import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface SamsListContextState {
	data: {
		filtered: Sam[]
		raw: Sam[]
	}
	filters: {
		search: UseFilterStateStringReturnType
		agency: UseFilterStateListReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

export const SamsListContext = createContext<SamsListContextState | undefined>(undefined);

export const useSamsListContext = () => {
	const context = useContext(SamsListContext);
	if (!context) {
		throw new Error('useSamsListContext must be used within a SamsListContextProvider');
	}
	return context;
};

export function SamsListContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const filterSearch = useFilterStateString('search');

	const { data: allSamsData, error: allSamsError, isLoading: allSamsLoading } = useSWR<Sam[], Error>(API_ROUTES.controller.SAMS_LIST, { refreshInterval: 5000 });

	//
	// B. Fetch data

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.sams.actions.read],
		scope: PermissionCatalog.all.sams.scope,
	});

	const searchResultsData = useSearch<Sam>({
		accessors: ['_id', 'agency_id'],
		data: allSamsData ?? [],
		query: filterSearch.value,
	});
	
	const filterAgency = useFilterStateList('agency_id', filteredAgencyIds, filteredAgencyOptions);

	//
	// C. Handle actions

	const handleFilter = (filter: string, value: string) => {
		if (filter === 'search') {
			filterSearch.set(value);
		} else if (filter === 'agency') {
			filterAgency.set([value]);		
		}
	};

	//
	// D. Define context value

	const contextValue: SamsListContextState = useMemo(() => ({
		data: {
			setFilter: handleFilter,
			filtered: searchResultsData,
			raw: allSamsData ?? [],
		},
		filters: {
			search: filterSearch,
			agency: filterAgency,
		},
		flags: {
			error: allSamsError,
			loading: allSamsLoading,
		},
	}), [allSamsError, allSamsLoading, filterSearch, searchResultsData, allSamsData, filterAgency]);

	//
	// E. Render components

	return (
		<SamsListContext.Provider value={contextValue}>
			{children}
		</SamsListContext.Provider>
	);
}

'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Sam } from '@tmlmobilidade/types';
import { useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';

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

	const searchResultsData = useSearch<Sam>({
		accessors: ['_id', 'agency_id'],
		data: allSamsData ?? [],
		query: filterSearch.value,
	});

	//
	// C. Handle actions

	//
	// D. Define context value

	const contextValue: SamsListContextState = useMemo(() => ({
		data: {
			filtered: searchResultsData,
			raw: allSamsData ?? [],
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			error: allSamsError,
			loading: allSamsLoading,
		},
	}), [allSamsError, allSamsLoading, filterSearch, searchResultsData, allSamsData]);
	// E. Render components

	return (
		<SamsListContext.Provider value={contextValue}>
			{children}
		</SamsListContext.Provider>
	);
}

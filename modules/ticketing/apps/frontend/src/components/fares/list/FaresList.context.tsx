'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Fare, PermissionCatalog } from '@tmlmobilidade/types';
import { useFilterStateString, type UseFilterStateStringReturnType, useMeContext, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface FaresListContextState {
	data: {
		filtered: Fare[]
		raw: Fare[]
	}
	filters: {
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

	const filterSearch = useFilterStateString('search');
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { data: allFaresData, error: allFaresError, isLoading: allFaresLoading } = useSWR<Fare[], Error>(API_ROUTES.ticketing.FARES_LIST, { refreshInterval: 5000 });

	//
	// C. Transform data

	const searchResultsData = useSearch<Fare>({
		accessors: ['_id', 'name', 'code'],
		data: allFaresData ?? [],
		query: filterSearch.value,
	});

	const canCreatePermission = meContext.actions.hasPermission(PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.create);

	// D. Define context value
	const contextValue: FaresListContextState = useMemo(() => ({
		data: {
			filtered: searchResultsData,
			raw: allFaresData ?? [],
		},
		filters: {
			search: filterSearch,
		},
		flags: {
			canCreate: canCreatePermission,
			error: allFaresError,
			loading: allFaresLoading,
		},
	}), [allFaresError, allFaresLoading, searchResultsData, allFaresData, filterSearch]);

	// E. Render components
	return (
		<FaresListContext.Provider value={contextValue}>
			{children}
		</FaresListContext.Provider>
	);
};

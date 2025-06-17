'use client';

import { swrFetcher } from '@/lib/http';
import { Routes } from '@/lib/routes';
import { Agency } from '@tmlmobilidade/types';
import { useSearchQuery } from '@tmlmobilidade/ui';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

interface AgencyListContextState {
	actions: {
		changeSearchQuery: (query: string) => void
	}
	data: {
		filtered: Agency[]
		raw: Agency[]
	}
	filters: {
		search_query: string
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

const AgencyListContext = createContext<AgencyListContextState | undefined>(undefined);

export const useAgencyListContext = () => {
	const context = useContext(AgencyListContext);
	if (!context) {
		throw new Error('useAgencyListContext must be used within an AgencyListContextProvider');
	}
	return context;
};

export const AgencyListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables
	const { data: allAgenciesData, error: allAgenciesError, isLoading: allAgenciesLoading } = useSWR<Agency[], Error>(Routes.API(Routes.AGENCY_LIST), swrFetcher);
	const rawAgencies = useMemo(() => allAgenciesData || [], [allAgenciesData]);

	//
	// B. Transform Data
	const { filteredData: searchFilteredAgencies, searchQuery, setSearchQuery } = useSearchQuery(rawAgencies, {
		accessors: ['name'],
	});

	const filteredAgencies = useMemo(() => {
		return searchFilteredAgencies ?? rawAgencies;
	}, [searchFilteredAgencies, rawAgencies]);

	//
	// C. Handle actions

	//
	// D. Define context value
	const contextValue: AgencyListContextState = useMemo(() => ({
		actions: {
			changeSearchQuery: setSearchQuery,
		},
		data: {
			filtered: filteredAgencies,
			raw: rawAgencies,
		},
		filters: {
			search_query: searchQuery ?? '',
		},
		flags: {
			error: allAgenciesError ?? undefined,
			loading: allAgenciesLoading,
		},
	}), [allAgenciesData, allAgenciesError, allAgenciesLoading, filteredAgencies, rawAgencies, searchQuery]);

	//	E. Render Component
	return (
		<AgencyListContext.Provider value={contextValue}>
			{children}
		</AgencyListContext.Provider>
	);
};

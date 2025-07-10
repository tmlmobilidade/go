'use client';

import { getAppConfig } from '@tmlmobilidade/lib';
/* * */

import { type Agency } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AgenciesContextState {
	data: {
		raw: Agency[]
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const AgenciesContext = createContext<AgenciesContextState | undefined>(undefined);

export const useAgenciesContext = () => {
	const context = useContext(AgenciesContext);
	if (!context) {
		throw new Error('useAgenciesContext must be used within an AgenciesContextProvider');
	}
	return context;
};

/* * */

export const AgenciesContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allAgenciesData, error: allAgenciesError, isLoading: allAgenciesLoading } = useSWR<Agency[], Error>(`${getAppConfig('auth', 'frontend_url')}/api/agencies`, swrFetcher);

	//
	// B. Define context value

	const contextValue: AgenciesContextState = useMemo(() => ({
		data: {
			raw: allAgenciesData ?? [],
		},
		flags: {
			error: allAgenciesError,
			loading: allAgenciesLoading,
		},
	}), [
		allAgenciesData,
		allAgenciesError,
		allAgenciesLoading,
	]);

	//
	// C. Render components

	return (
		<AgenciesContext.Provider value={contextValue}>
			{children}
		</AgenciesContext.Provider>
	);

	//
};

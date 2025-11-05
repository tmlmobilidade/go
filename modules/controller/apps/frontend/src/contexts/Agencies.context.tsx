'use client';

/* * */

import { getAppConfig } from '@tmlmobilidade/go-lib';
import { type Agency } from '@tmlmobilidade/go-types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AgenciesContextState {
	data: {
		ids: string[]
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

	const { data: allAgenciesData, error: allAgenciesError, isLoading: allAgenciesLoading } = useSWR<Agency[], Error>(`${getAppConfig('auth', 'frontend_url')}/api/agencies`);

	//
	// B. Define context value

	const contextValue: AgenciesContextState = useMemo(() => ({
		data: {
			ids: allAgenciesData ? allAgenciesData.map(item => item._id) : [],
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

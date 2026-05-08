'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { SelectDataItem } from '../components/inputs/Select';

/* * */

interface AgenciesContextState {
	data: {
		as_options: SelectDataItem[]
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

	const { data: allAgenciesData, error: allAgenciesError, isLoading: allAgenciesLoading } = useSWR<Agency[], Error>(API_ROUTES.auth.AGENCIES_LIST);

	//
	// B. Transform data

	const asOptionsData: SelectDataItem[] = useMemo(() => {
		if (!allAgenciesData) return [];
		return allAgenciesData
			.map(item => ({ label: `${item._id} - ${item.name}`, value: item._id }))
			.sort((a, b) => Number(a.value) - Number(b.value));
	}, [allAgenciesData]);

	//
	// C. Define context value

	const contextValue: AgenciesContextState = useMemo(() => ({
		data: {
			as_options: asOptionsData,
			raw: allAgenciesData ?? [],
		},
		flags: {
			error: allAgenciesError,
			loading: allAgenciesLoading,
		},
	}), [
		asOptionsData,
		allAgenciesData,
		allAgenciesError,
		allAgenciesLoading,
	]);

	//
	// D. Render components

	return (
		<AgenciesContext.Provider value={contextValue}>
			{children}
		</AgenciesContext.Provider>
	);

	//
};

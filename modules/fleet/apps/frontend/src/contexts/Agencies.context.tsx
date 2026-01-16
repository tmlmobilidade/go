'use client';

/* * */

import { type Agency } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AgenciesContextState {
	action: {
		labelAgency: (value: string) => string
	}
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

	const { data: allAgenciesData, error: allAgenciesError, isLoading: allAgenciesLoading } = useSWR<Agency[], Error>(API_ROUTES.auth.AGENCIES_LIST);

	//
	// B. Define context value

	const labelAgency = (agencyId: string | undefined) => {
		if (!agencyId || !allAgenciesData || allAgenciesData.length === 0) return '-';

		const agency = allAgenciesData.find(a => a._id === agencyId);

		if (!agency) return agencyId;

		return `${agency._id} - ${agency.name}`;
	};

	const contextValue: AgenciesContextState = useMemo(() => ({
		action: {
			labelAgency,
		},
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

'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PerformanceNetworkAgency } from '@tmlmobilidade/go-types-performance';
import { createContext, type PropsWithChildren, useContext } from 'react';
import useSWR from 'swr';

/* * */

interface AgenciesContextState {
	data: {
		agencies: PerformanceNetworkAgency[]
	}
	flags: {
		has_error: boolean
		is_loading: boolean
	}
}

/* * */

const AgenciesContext = createContext<AgenciesContextState | undefined>(undefined);

/* * */

export function useAgenciesContext() {
	const context = useContext(AgenciesContext);
	if (!context) {
		throw new Error('useAgenciesContext must be used within an AgenciesContextProvider');
	}
	return context;
}

/* * */

export function AgenciesContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Fetch data

	const request = useSWR<PerformanceNetworkAgency[], Error>(API_ROUTES.performance.NETWORK_AGENCIES);

	//
	// B. Render components

	return (
		<AgenciesContext.Provider
			value={{
				data: { agencies: request.data ?? [] },
				flags: { has_error: !!request.error, is_loading: request.isLoading },
			}}
		>
			{children}
		</AgenciesContext.Provider>
	);

	//
}

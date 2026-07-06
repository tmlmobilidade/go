'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface NetworkContextState {
	data: {
		lines: string[]
		patterns: string[]
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const NetworkContext = createContext<NetworkContextState | undefined>(undefined);

export function useNetworkContext() {
	const context = useContext(NetworkContext);
	if (!context) {
		throw new Error('useNetworkContext must be used within a NetworkContextProvider');
	}
	return context;
}

/* * */

export const NetworkContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const { data: allLinesData, isLoading: allLinesLoading } = useSWR<string[]>(API_ROUTES.performance.NETWORK_LINES);
	const { data: allPatternsData, isLoading: allPatternsLoading } = useSWR<string[]>(API_ROUTES.performance.NETWORK_PATTERNS);

	//
	// B. Handle actions

	//
	// C. Define context value

	const contextValue: NetworkContextState = useMemo(() => ({
		data: {
			lines: allLinesData || [],
			patterns: allPatternsData || [],
		},
		flags: {
			is_loading: allLinesLoading || allPatternsLoading,
		},
	}), [
		allLinesData,
		allLinesLoading,
		allPatternsData,
		allPatternsLoading,
	]);

	//
	// D. Render components

	return (
		<NetworkContext.Provider value={contextValue}>
			{children}
		</NetworkContext.Provider>
	);

	//
};

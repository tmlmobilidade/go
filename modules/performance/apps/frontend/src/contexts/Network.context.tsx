'use client';

/* * */

import { useNetworkLinesData } from '@/hooks/use-network-lines-data';
import { useNetworkPatternsData } from '@/hooks/use-network-patterns-data';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

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

export const NetworkContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allLinesData, isLoading: allLinesLoading } = useNetworkLinesData();
	const { data: allPatternsData, isLoading: allPatternsLoading } = useNetworkPatternsData();

	//
	// B. Define context value

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
	// C. Render components

	return (
		<NetworkContext.Provider value={contextValue}>
			{children}
		</NetworkContext.Provider>
	);

	//
};

'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubLine, type HubRoute } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LinesContextState {
	data: {
		lines: HubLine[]
		routes: HubRoute[]
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

/* * */

const LinesContext = createContext<LinesContextState | undefined>(undefined);

export const useLinesContext = () => {
	const context = useContext(LinesContext);
	if (!context) {
		throw new Error('useLinesContext must be used within an LinesContextProvider');
	}
	return context;
};

/* * */

export function LinesContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Fetch data

	const { data: allLinesData, isLoading: allLinesLoading } = useSWR<HubLine[], Error>({ credentials: 'omit', url: API_ROUTES.hub.NETWORK_LINES });
	const { data: allRoutesData, isLoading: allRoutesLoading } = useSWR<HubRoute[], Error>({ credentials: 'omit', url: API_ROUTES.hub.NETWORK_ROUTES });

	const normalizedLinesData = useMemo(() => {
		return Array.isArray(allLinesData) ? allLinesData : [];
	}, [allLinesData]);

	const normalizedRoutesData = useMemo(() => {
		return Array.isArray(allRoutesData) ? allRoutesData : [];
	}, [allRoutesData]);

	//
	// B. Define context value

	const contextValue: LinesContextState = {
		data: {
			lines: normalizedLinesData,
			routes: normalizedRoutesData,
		},
		flags: {
			error: undefined,
			isLoading: allLinesLoading || allRoutesLoading,
		},
	};

	//
	// C. Render components

	return (
		<LinesContext.Provider value={contextValue}>
			{children}
		</LinesContext.Provider>
	);
};

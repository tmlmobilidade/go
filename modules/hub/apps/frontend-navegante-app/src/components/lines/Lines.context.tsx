'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubLine, type HubRoute } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LinesContextState {
	data: {
		lines: HubLine[]
		routes: HubRoute[]
	}
	flags: {
		is_loading: boolean
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

	const { data: allLinesResponse, isLoading: allLinesLoading } = useSWR<ApiResponse<HubLine[]>>(API_ROUTES.hub.NETWORK_LINES, {
		fetcher: async url => await fetchApiData<HubLine[]>({ options: { credentials: 'omit' }, url }),
	});
	const { data: allRoutesResponse, isLoading: allRoutesLoading } = useSWR<ApiResponse<HubRoute[]>>(API_ROUTES.hub.NETWORK_ROUTES, {
		fetcher: async url => await fetchApiData<HubRoute[]>({ options: { credentials: 'omit' }, url }),
	});

	const normalizedLinesData = useMemo(() => {
		return allLinesResponse?.data ?? [];
	}, [allLinesResponse?.data]);

	const normalizedRoutesData = useMemo(() => {
		return allRoutesResponse?.data ?? [];
	}, [allRoutesResponse?.data]);

	//
	// B. Define context value

	const contextValue = useMemo<LinesContextState>(() => ({
		data: {
			lines: normalizedLinesData,
			routes: normalizedRoutesData,
		},
		flags: {
			is_loading: allLinesLoading || allRoutesLoading,
		},
	}), [allLinesLoading, allRoutesLoading, normalizedLinesData, normalizedRoutesData]);

	//
	// C. Render components

	return (
		<LinesContext.Provider value={contextValue}>
			{children}
		</LinesContext.Provider>
	);
};

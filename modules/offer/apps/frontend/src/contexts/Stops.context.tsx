'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopsContextState {
	data: {
		raw: Stop[]
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const StopsContext = createContext<StopsContextState | undefined>(undefined);

export const useStopsContext = () => {
	const context = useContext(StopsContext);
	if (!context) {
		throw new Error('useStopsContext must be used within an StopsContextProvider');
	}
	return context;
};

/* * */

export const StopsContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allStopsData, error: allStopsError, isLoading: allStopsLoading } = useSWR<ApiResponse<Stop[]>>(API_ROUTES.infrastructure.STOPS_LIST, {
		fetcher: async url => await fetchApiData<Stop[]>({ url }),
	});

	//
	// B. Define context value

	const contextValue: StopsContextState = useMemo(() => {
		return {
			data: {
				raw: allStopsData?.data?.sort((a, b) => a.name.localeCompare(b.name)) ?? [],
			},
			flags: {
				error: allStopsError,
				loading: allStopsLoading,
			},
		};
	}, [
		allStopsData,
		allStopsError,
		allStopsLoading,
	]);

	//
	// C. Render components

	return (
		<StopsContext.Provider value={contextValue}>
			{children}
		</StopsContext.Provider>
	);

	//
};

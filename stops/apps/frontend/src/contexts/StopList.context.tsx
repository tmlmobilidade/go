'use client';

import { Routes } from '@/lib/routes';
/* * */

import { Stop } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface StopListContextState {
	actions: {
		changeSearchQuery: (query: string) => void
	}
	data: {
		raw: Stop[]
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

/* * */

/* * */

const StopListContext = createContext<StopListContextState | undefined>(undefined);

export const useStopListContext = () => {
	const context = useContext(StopListContext);
	if (!context) {
		throw new Error('useStopListContext must be used within an StopListContextProvider');
	}
	return context;
};

/* * */

export const StopListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables

	const { data: stops, error: allStopsError, isLoading: allStopsLoading } = useSWR<Stop[], Error>(Routes.ME, swrFetcher);
	const rawStops = useMemo(() => stops || [], [stops]);

	const [stop, setStop] = useState('teste');

	const contextValue: StopListContextState = useMemo(() => ({
		actions: {
			changeSearchQuery: setStop,
		},
		data: {
			raw: rawStops,
		},
		flags: {
			error: allStopsError,
			isLoading: allStopsLoading,
		},
	}), [stop, stops, allStopsLoading, allStopsError, rawStops]);

	return (
		<StopListContext.Provider value={contextValue}>
			{children}
		</StopListContext.Provider>
	);
};

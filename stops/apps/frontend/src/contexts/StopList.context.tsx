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

	const { data: allStopsData, error: allStopsError, isLoading: allStopsLoading } = useSWR<Stop[], Error>(Routes.ME, swrFetcher);
	const rawStops = useMemo(() => allStopsData || [], [allStopsData]);

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
	}), [stop, allStopsData, allStopsLoading, allStopsError, rawStops]);

	console.log('------->', stop);

	return (
		<StopListContext.Provider value={contextValue}>
			{children}
		</StopListContext.Provider>
	);
};

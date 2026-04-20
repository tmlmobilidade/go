'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Stop } from '@tmlmobilidade/types';
import { type SelectDataItem } from '@tmlmobilidade/ui';
import { createContext, useCallback, useContext } from 'react';
import useSWR from 'swr';

/* * */

interface StopsContextState {
	actions: {
		getStopById: (stopId: string) => Stop | undefined
	}
	data: {
		options: SelectDataItem[]
		raw: Stop[]
	}
	flags: {
		is_loading: boolean
	}
}

const StopsContext = createContext<StopsContextState | undefined>(undefined);

export function useStopsContext() {
	const context = useContext(StopsContext);
	if (!context) {
		throw new Error('useStopsContext must be used within a StopsContextProvider');
	}
	return context;
}

export function StopsContextProvider({ children }: { children: React.ReactNode }) {
	const { data: allStopsData, isLoading: allStopsLoading } = useSWR<Stop[]>(API_ROUTES.alerts.STOPS_LIST);
	const { data: allStopsOptionsData, isLoading: allStopsOptionsLoading } = useSWR<{ label: string, value: string }[]>(API_ROUTES.alerts.STOPS_BATCH);

	const getStopById = useCallback((stopId: string): Stop | undefined => {
		return allStopsData?.find(stop => stop._id === stopId) as Stop | undefined;
	}, [allStopsData]);

	const contextValue: StopsContextState = {
		actions: {
			getStopById,
		},
		data: {
			options: allStopsOptionsData || [],
			raw: allStopsData || [],
		},
		flags: {
			is_loading: allStopsLoading || allStopsOptionsLoading,
		},
	};

	return (
		<StopsContext.Provider value={contextValue}>
			{children}
		</StopsContext.Provider>
	);
}

'use client';

import { Routes } from '@/lib/routes';
import { type StopNormalized } from '@/types/normalized';
import { Stop } from '@tmlmobilidade/types';
import { useSearch } from '@tmlmobilidade/ui';
import { normalizeString, swrFetcher } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

interface StopListContextState {
	actions: {
		changeSearchQuery: (query: string) => void
	}
	data: {
		filtered: Stop[]
		raw: Stop[]
	}
	filters: {
		filterFacilities: StopNormalized[]
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

const StopListContext = createContext<StopListContextState | undefined>(undefined);

export const useStopListContext = () => {
	const context = useContext(StopListContext);
	if (!context) {
		throw new Error(
			'useStopListContext must be used within a StopListContextProvider',
		);
	}
	return context;
};

export const StopListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables
	const [filterSearch, setfilterSearch] = useQueryState('search', {
		defaultValue: '',
	});

	//
	// B. Fetch data

	const { data: stops, error, isLoading } = useSWR<Stop[], Error>(Routes.ME, swrFetcher);

	const rawStops = useMemo(() => stops || [], [stops]);

	//
	// C. Transform data

	const normalizedStopData: StopNormalized[] = useMemo(() => {
		if (!stops) return [];

		return stops.map(item => ({
			...item,
			id_normalized: item._id,
			name_normalized: normalizeString(item.name),
		}));
	}, [stops]);

	const searchResultsData = useSearch<StopNormalized>({
		accessors: ['_id', 'name'],
		data: normalizedStopData,
		query: filterSearch,
	});

	const changeSearchQuery = (query: string) => {
		setfilterSearch(query);
	};

	const contextValue: StopListContextState = useMemo(
		() => ({
			actions: {
				changeSearchQuery: changeSearchQuery,
			},
			data: {
				filtered: searchResultsData,
				raw: rawStops,
			},
			filters: {
				filterFacilities: searchResultsData,
			},
			flags: {
				error,
				isLoading,
			},
		}),
		[searchResultsData, rawStops, error, isLoading],
	);

	return (
		<StopListContext.Provider value={contextValue}>
			{children}
		</StopListContext.Provider>
	);
};

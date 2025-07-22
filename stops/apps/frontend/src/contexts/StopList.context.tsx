'use client';

import { Routes } from '@/lib/routes';
import { Stop } from '@tmlmobilidade/types';
import { useSearchQuery } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { createContext, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

interface StopListContextState {
	actions: {
		changeSearchQuery: (query: string) => void
	}
	data: {
		filtered: Stop[]
		raw: Stop[]
		searchQuery: string
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
		throw new Error('useStopListContext must be used within a StopListContextProvider');
	}
	return context;
};

export const StopListContextProvider = ({ children }: { children: React.ReactNode }) => {
	const [paramSearch, setParamSearch] = useQueryState('search');

	// Fetch stops
	const { data: stops, error, isLoading } = useSWR<Stop[], Error>(Routes.ME, swrFetcher);
	const rawStops = useMemo(() => stops || [], [stops]);

	// Normalize fields
	const normalizedRecords = useMemo(() => {
		return rawStops.map(stop => ({
			...stop,
			_id: stop._id.toLowerCase(),
			municipality_id: stop.municipality_id.toLowerCase(),
			name: stop.name.toLowerCase(),
		}));
	}, [rawStops]);

	// Custom search logic
	const customSearch = (stop: Stop, query: string) => {
		const normalizedQuery = query.toLowerCase();

		const municipalityMatch = stop.municipality_id.includes(normalizedQuery);
		const stopNameMatch = stop.name.includes(normalizedQuery);
		const stopIdMatch = stop._id.includes(normalizedQuery);

		return municipalityMatch || stopNameMatch || stopIdMatch;
	};

	// Search query with filter
	const { filteredData: searchFiltered, searchQuery, setSearchQuery } = useSearchQuery<Stop>(normalizedRecords, {
		accessors: ['_id', 'municipality_id', 'name'],
		customSearch,
		debounce: 500,
	});

	// Keep URL params in sync
	useEffect(() => {
		if (paramSearch !== searchQuery) {
			setParamSearch(searchQuery);
		}
	}, [searchQuery]);

	// Map search results again (optional)
	const filteredStops = useMemo(() => {
		return searchFiltered.map(stop => ({
			...stop,
			_id: stop._id.toLowerCase(),
			municipality_id: stop.municipality_id.toLowerCase(),
			name: stop.name.toLowerCase(),
		}));
	}, [searchFiltered]);

	const contextValue: StopListContextState = useMemo(() => ({
		actions: {
			changeSearchQuery: setSearchQuery,
		},
		data: {
			filtered: filteredStops,
			raw: rawStops,
			searchQuery,
		},
		flags: {
			error,
			isLoading,
		},
	}), [rawStops, filteredStops, searchQuery, error, isLoading]);

	return (
		<StopListContext.Provider value={contextValue}>
			{children}
		</StopListContext.Provider>
	);
};

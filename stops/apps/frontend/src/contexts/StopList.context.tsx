'use client';

import { Routes } from '@/lib/routes';
import { Stop } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
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
		throw new Error('useStopListContext must be used within an StopListContextProvider');
	}
	return context;
};

export const StopListContextProvider = ({ children }: { children: React.ReactNode }) => {
	// Fetch stops
	const { data: stops, error, isLoading } = useSWR<Stop[], Error>(Routes.ME, swrFetcher);
	const rawStops = useMemo(() => stops || [], [stops]);

	// Search query state
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

	// Debounce search query to improve filtering performance
	useMemo(() => {
		const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
		return () => clearTimeout(handler);
	}, [searchQuery]);

	// Filtering logic: filter stops by name, id, or municipality_ids
	const filteredStops = useMemo(() => {
		if (!debouncedQuery.trim()) return rawStops;
		const query = debouncedQuery.toLowerCase();
		return rawStops.filter(stop =>
			(stop.name && stop.name.toLowerCase().includes(query))
			|| (stop._id && stop._id.toLowerCase().includes(query))
			|| (typeof stop.municipality_id === 'string' && stop.municipality_id.toLowerCase().includes(query)),
		);
	}, [rawStops, debouncedQuery]);

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

'use client';

import { Routes } from '@/lib/routes';
import { Stop } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
		throw new Error(
			'useStopListContext must be used within an StopListContextProvider',
		);
	}
	return context;
};

function useSearchQuery<T>(
	data: T[],
	options: {
		accessors?: (keyof T)[]
		customSearch?: (item: T, query: string) => boolean
		debounce?: number
	},
) {
	const [searchQuery, setSearchQuery] = useState('');
	const filteredData = useMemo(() => {
		if (!searchQuery) return data;

		if (options.customSearch) {
			return data.filter(item => options.customSearch(item, searchQuery));
		}

		if (options.accessors) {
			return data.filter(item =>
				options.accessors.some(key =>
					String(item[key]).toLowerCase().includes(searchQuery.toLowerCase()),
				),
			);
		}

		return data;
	}, [data, searchQuery, options]);

	return { filteredData, searchQuery, setSearchQuery };
}

export const StopListContextProvider = ({ children }: { children: React.ReactNode }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [paramSearch, setParamSearch] = useQueryState('search');

	const { data: stops, error, isLoading } = useSWR<Stop[], Error>(Routes.ME, swrFetcher);

	const rawStops = useMemo(() => stops || [], [stops]);

	const normalizedRecords = useMemo(() => {
		return rawStops.map(stop => ({
			...stop,
			_id: stop._id.toLowerCase(),
			municipality_id: stop.municipality_id.toLowerCase(),
			name: stop.name.toLowerCase(),
		}));
	}, [rawStops]);

	const customSearch = (stop: Stop, query: string) => {
		const q = query.toLowerCase();
		return (
			stop._id.toLowerCase().includes(q) || stop.name.toLowerCase().includes(q) || stop.municipality_id.toLowerCase().includes(q)
		);
	};

	const { filteredData: searchFiltered, searchQuery, setSearchQuery } = useSearchQuery<Stop>(normalizedRecords, {
		accessors: ['municipality_id', 'name', '_id'],
		customSearch,
	});

	useEffect(() => {
		setParamSearch(searchQuery);
	}, [searchQuery]);

	const filteredStops = useMemo(() => {
		return searchFiltered.map(stop => ({
			...stop,
			_id: stop._id.toLowerCase(),
			municipality_id: stop.municipality_id.toLowerCase(),
			name: stop.name.toLowerCase(),
		}));
	}, [searchFiltered]);

	const contextValue: StopListContextState = useMemo(
		() => ({
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
		}),
		[filteredStops, rawStops, searchQuery, error, isLoading],
	);

	return (
		<StopListContext.Provider value={contextValue}>
			{children}
		</StopListContext.Provider>
	);
};

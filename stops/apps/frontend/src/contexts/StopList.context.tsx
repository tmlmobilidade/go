'use client';

import { Routes } from '@/lib/routes';
import { Stop } from '@tmlmobilidade/types';
import { useSearch } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
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
	const [paramSearch, setParamSearch] = useQueryState('search', {
		defaultValue: '',
	});

	const { data: stops, error, isLoading } = useSWR<Stop[], Error>(Routes.ME, swrFetcher);

	const rawStops = useMemo(() => stops || [], [stops]);

	const filteredStops = useSearch<Stop>({
		customSearch: (stopSearch, query) => {
			const _id = stopSearch._id?.toLowerCase?.() || '';
			const name = stopSearch.name?.toLowerCase?.() || '';
			const municipality_id = stopSearch.municipality_id?.toLowerCase?.() || '';

			return (
				_id.includes(query)
				|| name.includes(query)
				|| municipality_id.includes(query)
			);
		},
		data: rawStops,
		debounce: 500,
		query: paramSearch,
	});

	const changeSearchQuery = (query: string) => {
		setParamSearch(query);
	};

	console.log('filteredStops', filteredStops);

	const contextValue: StopListContextState = useMemo(
		() => ({
			actions: {
				changeSearchQuery: changeSearchQuery,
			},
			data: {
				filtered: filteredStops,
				raw: rawStops,
			},
			flags: {
				error,
				isLoading,
			},
		}),
		[filteredStops, rawStops, error, isLoading],
	);

	return (
		<StopListContext.Provider value={contextValue}>
			{children}
		</StopListContext.Provider>
	);
};

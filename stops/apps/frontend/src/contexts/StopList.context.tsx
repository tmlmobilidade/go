'use client';

import { Routes } from '@/lib/routes';
import { Stop } from '@tmlmobilidade/types';
import { useSearch } from '@tmlmobilidade/ui';
import { swrFetcher } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { createContext, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

// interface UseSearchQueryOptions<Stop> {
// 	customSearch?: (stopSearch: Stop, query: string) => boolean
// 	debounce?: number
// }

// function useSearchQuery<Stop>(data: Stop[], options: UseSearchQueryOptions<Stop> = {}) {
// 	const { customSearch, debounce = 300 } = options;
// 	const [searchQuery, setSearchQuery] = useState('');
// 	const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

// 	// Debounce search
// 	useEffect(() => {
// 		const handler = setTimeout(() => {
// 			setDebouncedQuery(searchQuery);
// 		}, debounce);

// 		return () => clearTimeout(handler);
// 	}, [searchQuery, debounce]);

// 	const filteredData = useMemo(() => {
// 		if (!debouncedQuery) return data;

// 		const query = debouncedQuery.toLowerCase();

// 		return data.filter((stopSearch) => {
// 			if (customSearch) return customSearch(stopSearch, query);

// 			const _id = stopSearch._id?.toLowerCase?.() || '';
// 			const name = stopSearch.name?.toLowerCase?.() || '';
// 			const municipality_id = stopSearch.municipality_id?.toLowerCase?.() || '';

// 			return (
// 				_id.includes(query)
// 				|| name.includes(query)
// 				|| municipality_id.includes(query)
// 			);
// 		});
// 	}, [data, debouncedQuery, customSearch]);

// 	return {
// 		filteredData,
// 		searchQuery,
// 		setSearchQuery,
// 	};
// }

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

	// const normalizedRecords = useMemo(() => {
	// 	return rawStops.map(stop => ({
	// 		...stop,
	// 		_id: stop._id.toLowerCase(),
	// 		municipality_id: stop.municipality_id.toLowerCase(),
	// 		name: stop.name.toLowerCase(),
	// 	}));
	// }, [rawStops]);

	// const { filteredData: filteredStops, searchQuery, setSearchQuery } = useSearchQuery<Stop>(normalizedRecords, {
	// 	debounce: 500,
	// });

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

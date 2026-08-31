'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type District } from '@tmlmobilidade/go-types-locations';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopsDistrictsDataReturnType {
	data: District[]
	error: null | string
	ids: string[]
	isLoading: boolean
	map: Map<string, District>
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch districts data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the districts data.
 */
export function useStopsDistrictsData(): StopsDistrictsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<District[]>>([API_ROUTES.infrastructure.STOPS_LIST_MUNICIPALITIES, request], {
		fetcher: async ([url, request]) => await fetchApiData<District[]>({ body: request, method: 'POST', url: url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const idsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to array of IDs
		return data.data.map(item => item._id);
	}, [data?.data]);

	const optionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to SelectDataItem format
		return data.data.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.name}`,
			value: item._id,
		}));
	}, [data?.data]);

	const mapData = useMemo(() => {
		return new Map(data?.data?.map(item => [item._id, item]));
	}, [data?.data]);

	//
	// D. Return value

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		ids: idsData,
		isLoading,
		map: mapData,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, idsData, isLoading, isValidating, optionsData, data?.timestamp]);
};

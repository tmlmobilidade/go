'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsMunicipalityItem, type StopsMunicipalityRequest } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopsMunicipalitiesDataReturnType {
	data: StopsMunicipalityItem[]
	error: null | string
	ids: string[]
	isLoading: boolean
	map: Map<string, StopsMunicipalityItem>
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch municipalities data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the municipalities data.
 */
export function useStopsMunicipalitiesData(request: StopsMunicipalityRequest): StopsMunicipalitiesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<StopsMunicipalityItem[]>>([API_ROUTES.infrastructure.STOPS_LIST_MUNICIPALITIES, request], {
		fetcher: async ([url, request]) => await fetchApiData<StopsMunicipalityItem[]>({ body: request, method: 'POST', url: url }),
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

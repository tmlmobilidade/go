'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AgenciesPlatformRequest, type AgenciesPlatformResponse } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type SelectDataItem } from '../components/inputs/Select';
import { fetchApiData } from '../fetch/fetch-api-data';

/* * */

interface UseAgenciesDataReturnType {
	data: AgenciesPlatformResponse[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	options: SelectDataItem[]
	timestamp: null | UnixTimestamp
}

/**
 * Hook to fetch agencies data. Useful for supplying data
 * to filters or select components.
 * @param props The request to fetch the agencies data.
 * @returns An object containing the agencies data.
 */
export function useAgenciesData(props: AgenciesPlatformRequest): UseAgenciesDataReturnType {
	//

	//
	// A. Transform data

	const query = useMemo<AgenciesPlatformRequest>(() => ({ ...props }), [props]);

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<AgenciesPlatformResponse[]>>([API_ROUTES.core.PLATFORM_AGENCIES, query], {
		fetcher: async ([url, query]) => await fetchApiData<AgenciesPlatformResponse[]>({ body: query, method: 'POST', url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const filteredIds = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Keep only the IDs of the response data
		return data.data.map(item => item._id);
	}, [data?.data]);

	const optionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to SelectDataItem format
		return data.data.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.code} - ${item.name}`,
			value: item._id,
		}));
	}, [data?.data]);

	//
	// D. Return value

	return useMemo(() => ({
		data: data?.data ?? [],
		error: error?.error,
		ids: filteredIds,
		isLoading: isLoading,
		isValidating: isValidating,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, filteredIds, isLoading, isValidating, optionsData, data?.timestamp]);
};

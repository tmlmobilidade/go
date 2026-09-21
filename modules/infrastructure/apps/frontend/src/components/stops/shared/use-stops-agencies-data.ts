'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsAgencyItem, type StopsAgencyRequest } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseStopsAgenciesDataReturnType {
	data: StopsAgencyItem[]
	error: null | string
	ids: string[]
	isLoading: boolean
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch the agencies the user has access to for the given permissions.
 * Useful for supplying data to filters or select components.
 * @param request The permissions registry to filter the agencies by.
 * @returns An object containing the agencies data.
 */
export function useStopsAgenciesData(request: StopsAgencyRequest): UseStopsAgenciesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading } = useSWR<ApiResponse<StopsAgencyItem[]>>([API_ROUTES.infrastructure.STOPS_LIST_AGENCIES, request], {
		fetcher: async ([url, request]: [string, StopsAgencyRequest]) => await fetchApiData<StopsAgencyItem[]>({ body: request, method: 'POST', url }),
		refreshInterval: 600_000, // 10 minutes
	});

	//
	// B. Transform data

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
			label: `[${item._id}] ${item.code} - ${item.name}`,
			value: item._id,
		}));
	}, [data?.data]);

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		ids: idsData,
		isLoading,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, idsData, isLoading, optionsData, data?.timestamp]);
};

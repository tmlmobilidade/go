'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type VehiclesAgencyItem, type VehiclesAgencyRequest } from '@tmlmobilidade/go-operation-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem, toAgencySelectItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseVehiclesAgenciesDataReturnType {
	data: VehiclesAgencyItem[]
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
export function useVehiclesAgenciesData(request: VehiclesAgencyRequest): UseVehiclesAgenciesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading } = useSWR<ApiResponse<VehiclesAgencyItem[]>>([API_ROUTES.operation.VEHICLES_LIST_AGENCIES, request], {
		fetcher: async ([url, request]: [string, VehiclesAgencyRequest]) => await fetchApiData<VehiclesAgencyItem[]>({ body: request, method: 'POST', url }),
		refreshInterval: 600_000, // 10 minutes
	});

	//
	// B. Transform data

	const idsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to array of IDs
		return [...new Set(data.data.map(item => item._id))];
	}, [data?.data]);

	const optionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to SelectDataItem format
		return [...new Map(data.data.map(item => [item._id, item])).values()].map(toAgencySelectItem);
	}, [data?.data]);

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: data?.error ?? error?.message,
		ids: idsData,
		isLoading,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, data?.error, error?.message, idsData, isLoading, optionsData, data?.timestamp]);
};

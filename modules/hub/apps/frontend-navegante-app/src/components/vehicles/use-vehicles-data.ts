'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseVehiclesDataReturnType {
	data: HubV1ApiVehiclePosition[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useVehiclesData(): UseVehiclesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<HubV1ApiVehiclePosition[]>>(API_ROUTES.hub.VEHICLES_POSITIONS, {
		fetcher: async url => await fetchApiData<HubV1ApiVehiclePosition[]>({ options: { credentials: 'omit' }, url }),
		refreshInterval: 5_000,
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: error?.error ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, data?.timestamp, error?.error, isLoading, isValidating, mutate]);

	//
}

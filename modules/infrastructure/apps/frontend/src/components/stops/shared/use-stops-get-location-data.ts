'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsGetLocationRequest, type StopsGetLocationResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

/* * */

interface StopsGetLocationDataReturnType {
	data: StopsGetLocationResponse
	error: null | string
	isLoading: boolean
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch stop location data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the stop location data.
 */
export function useStopsGetLocationData(request: StopsGetLocationRequest): StopsGetLocationDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWRImmutable<ApiResponse<StopsGetLocationResponse>>([API_ROUTES.infrastructure.STOPS_GET_STOP_LOCATION, request], {
		fetcher: async ([url, request]) => await fetchApiData<StopsGetLocationResponse>({ body: request, method: 'POST', url: url }),
	});

	//
	// B. Return value

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, isLoading, isValidating, data?.timestamp]);
};

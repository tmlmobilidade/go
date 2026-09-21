'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsGetLocationRequest, type StopsGetLocationResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

/* * */

interface UseStopsGetLocationDataReturnType {
	data: StopsGetLocationResponse
	error: null | string
	isLoading: boolean
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch the administrative location for a pair of coordinates.
 * @param request The latitude and longitude to resolve.
 * @returns An object containing the location data.
 */
export function useStopsGetLocationData(request: StopsGetLocationRequest): UseStopsGetLocationDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading } = useSWRImmutable<ApiResponse<StopsGetLocationResponse>>([API_ROUTES.infrastructure.STOPS_GET_STOP_LOCATION, request], {
		fetcher: async ([url, request]: [string, StopsGetLocationRequest]) => await fetchApiData<StopsGetLocationResponse>({ body: request, method: 'POST', url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, isLoading, data?.timestamp]);
};

'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseVehiclesDetailPatternDataReturnType {
	data: HubV1ApiPattern[] | null | undefined
	error: string | undefined
	isLoading: boolean
}

/**
 * Fetches the pattern groups of the pattern the vehicle is currently serving.
 * @param patternId The pattern ID of the vehicle, if any.
 */
export function useVehiclesDetailPatternData(patternId: null | string | undefined): UseVehiclesDetailPatternDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading } = useSWR<ApiResponse<HubV1ApiPattern[]>>(patternId && API_ROUTES.hub.NETWORK_PATTERNS(patternId), {
		fetcher: async (url: string) => await fetchApiData<HubV1ApiPattern[]>({ credentials: 'omit', url }),
		refreshInterval: 5_000, // 5 seconds
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
	}), [data?.data, error, isLoading]);
}

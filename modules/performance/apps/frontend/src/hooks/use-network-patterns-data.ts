'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface UseNetworkPatternsDataReturnType {
	data: string[] | undefined
	error: null | string | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | undefined | UnixMilliseconds
}

/* * */

/**
 * Fetches the pattern IDs present in the metrics from the performance API.
 */
export function useNetworkPatternsData(): UseNetworkPatternsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<string[]>>(API_ROUTES.performance.NETWORK_PATTERNS, {
		fetcher: async (url: string) => await fetchApiData<string[]>({ url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? undefined,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.data, data?.timestamp, error, isLoading, isValidating, mutate]);
}

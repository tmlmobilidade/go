'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface UseNetworkLinesDataReturnType {
	data: string[] | undefined
	error: null | string | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | undefined | UnixMilliseconds
}

/* * */

/**
 * Fetches the line IDs present in the metrics from the performance API.
 */
export function useNetworkLinesData(): UseNetworkLinesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<string[]>>(API_ROUTES.performance.NETWORK_LINES, {
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

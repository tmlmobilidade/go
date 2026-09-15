'use client';

/* * */

import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export interface UseMetricDataReturnType<T> {
	data: T[] | undefined
	error: null | string | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | undefined | UnixMilliseconds
}

/* * */

/**
 * Fetches the documents of a metric from the performance API.
 * @param url The metric URL, or null to skip fetching
 */
export function useMetricData<T>(url: null | string): UseMetricDataReturnType<T> {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<T[]>>(url, {
		fetcher: async (fetchUrl: string) => await fetchApiData<T[]>({ url: fetchUrl }),
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

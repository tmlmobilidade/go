'use client';

/* * */

import { VIDEOWALL_METRICS_ROUTES } from '@/lib/videowall-metrics-routes';
import { type VideowallMetricsResponse, type VideowallVkmMetrics } from '@/types/videowall-metrics';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

export interface UseAreasVkmDataReturnType {
	data: null | undefined | VideowallVkmMetrics
	error: string | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<VideowallMetricsResponse<VideowallVkmMetrics>>
	timestamp: number | undefined
	timestamp_resource: number | undefined
}

/**
 * Fetches the executed vehicle kilometers metrics published by the Carris Metropolitana videowall API.
 */
export function useAreasVkmData(): UseAreasVkmDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<VideowallMetricsResponse<VideowallVkmMetrics>>(VIDEOWALL_METRICS_ROUTES.VKM, {
		fetcher: async (url: string) => await fetchApiData<VideowallVkmMetrics>({ credentials: 'omit', url }) as VideowallMetricsResponse<VideowallVkmMetrics>,
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data,
		error: data?.error ?? error?.message,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
		timestamp_resource: data?.timestamp_resource,
	}), [data?.data, data?.error, data?.timestamp, data?.timestamp_resource, error, isLoading, isValidating, mutate]);
};

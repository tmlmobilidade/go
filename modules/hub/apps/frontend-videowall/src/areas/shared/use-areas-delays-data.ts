'use client';

/* * */

import { VIDEOWALL_METRICS_ROUTES } from '@/lib/videowall-metrics-routes';
import { type VideowallDelaysMetrics, type VideowallMetricsResponse } from '@/types/videowall-metrics';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

export interface UseAreasDelaysDataReturnType {
	data: null | undefined | VideowallDelaysMetrics
	error: string | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<VideowallMetricsResponse<VideowallDelaysMetrics>>
	timestamp: number | undefined
	timestamp_resource: number | undefined
}

/**
 * Fetches the delays metrics published by the Carris Metropolitana videowall API.
 */
export function useAreasDelaysData(): UseAreasDelaysDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<VideowallMetricsResponse<VideowallDelaysMetrics>>(VIDEOWALL_METRICS_ROUTES.DELAYS, {
		fetcher: async (url: string) => await fetchApiData<VideowallDelaysMetrics>({ credentials: 'omit', url }) as VideowallMetricsResponse<VideowallDelaysMetrics>,
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

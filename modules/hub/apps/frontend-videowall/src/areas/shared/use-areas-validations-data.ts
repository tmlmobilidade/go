'use client';

/* * */

import { VIDEOWALL_METRICS_ROUTES } from '@/lib/videowall-metrics-routes';
import { type VideowallMetricsResponse, type VideowallValidationsMetrics } from '@/types/videowall-metrics';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

export interface UseAreasValidationsDataReturnType {
	data: null | undefined | VideowallValidationsMetrics
	error: string | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<VideowallMetricsResponse<VideowallValidationsMetrics>>
	timestamp: number | undefined
	timestamp_resource: number | undefined
}

/**
 * Fetches the validations (transported passengers) metrics published by the Carris Metropolitana videowall API.
 */
export function useAreasValidationsData(): UseAreasValidationsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<VideowallMetricsResponse<VideowallValidationsMetrics>>(VIDEOWALL_METRICS_ROUTES.VALIDATIONS, {
		fetcher: async (url: string) => await fetchApiData<VideowallValidationsMetrics>({ credentials: 'omit', url }) as VideowallMetricsResponse<VideowallValidationsMetrics>,
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

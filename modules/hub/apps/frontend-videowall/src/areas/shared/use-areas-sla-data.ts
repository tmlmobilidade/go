'use client';

/* * */

import { VIDEOWALL_METRICS_ROUTES } from '@/lib/videowall-metrics-routes';
import { type VideowallMetricsResponse, type VideowallSlaMetrics } from '@/types/videowall-metrics';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

export interface UseAreasSlaDataReturnType {
	data: null | undefined | VideowallSlaMetrics
	error: string | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<VideowallMetricsResponse<VideowallSlaMetrics>>
	timestamp: number | undefined
	timestamp_resource: number | undefined
}

/**
 * Fetches the service level (executed rides) metrics published by the Carris Metropolitana videowall API.
 */
export function useAreasSlaData(): UseAreasSlaDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<VideowallMetricsResponse<VideowallSlaMetrics>>(VIDEOWALL_METRICS_ROUTES.SLA, {
		fetcher: async (url: string) => await fetchApiData<VideowallSlaMetrics>({ credentials: 'omit', url }) as VideowallMetricsResponse<VideowallSlaMetrics>,
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

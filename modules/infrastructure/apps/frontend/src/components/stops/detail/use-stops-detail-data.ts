'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useStopsDetailStopId } from './use-stops-detail-stop-id';

/* * */

interface UseStopsDetailDataReturnType {
	data: Stop
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Stop>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useStopsDetailData(): UseStopsDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { stopId } = useStopsDetailStopId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Stop>>(stopId && API_ROUTES.infrastructure.STOPS_GET(String(stopId)), {
		fetcher: async (url: string) => await fetchApiData<Stop>({ url }),
		refreshInterval: 600_000, // 10 minutes
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating]);
};

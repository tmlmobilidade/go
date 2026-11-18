'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsPatternsResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { useStopsDetailStopId } from './use-stops-detail-stop-id';

/* * */

interface UseStopsDetailPatternsDataReturnType {
	data: StopsPatternsResponse
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<StopsPatternsResponse>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function useStopsDetailPatternsData(): UseStopsDetailPatternsDataReturnType {
	//

	//
	// A. Setup variables

	const { stopId } = useStopsDetailStopId();

	//
	// B. Fetch data independently of the stop record

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<StopsPatternsResponse>>(stopId ? API_ROUTES.infrastructure.STOPS_DETAIL_PATTERNS(stopId) : null, {
		fetcher: async (url: string) => await fetchApiData<StopsPatternsResponse>({ url }),
		refreshInterval: 60_000, // 1 minute
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}

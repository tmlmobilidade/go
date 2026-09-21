'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiAlert } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseAlertsDataReturnType {
	data: HubV1ApiAlert[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useAlertsData(): UseAlertsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<HubV1ApiAlert[]>>(API_ROUTES.hub.ALERTS_LIST, {
		fetcher: async url => await fetchApiData<HubV1ApiAlert[]>({ options: { credentials: 'omit' }, url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: error?.error ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, data?.timestamp, error?.error, isLoading, isValidating, mutate]);

	//
}

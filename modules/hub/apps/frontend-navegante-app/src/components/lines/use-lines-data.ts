'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiLine } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseLinesDataReturnType {
	data: HubV1ApiLine[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useLinesData(): UseLinesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<HubV1ApiLine[]>>(API_ROUTES.hub.NETWORK_LINES, {
		fetcher: async url => await fetchApiData<HubV1ApiLine[]>({ options: { credentials: 'omit' }, url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: data?.error ?? (error instanceof Error ? error.message : null),
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, data?.error, data?.timestamp, error, isLoading, isValidating, mutate]);

	//
}

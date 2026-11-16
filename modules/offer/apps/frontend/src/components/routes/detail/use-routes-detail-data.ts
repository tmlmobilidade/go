'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RoutesDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

interface UseRoutesDetailDataReturnType {
	data: RoutesDetail | undefined
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<RoutesDetail>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function useRoutesDetailData(routeId: string): UseRoutesDetailDataReturnType {
	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<RoutesDetail>>(routeId ? API_ROUTES.offer.ROUTES_DETAIL(routeId) : null, {
		fetcher: async (url: string) => await fetchApiData<RoutesDetail>({ url }),
		refreshInterval: 10_000,
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.error || error ? undefined : data?.data,
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}

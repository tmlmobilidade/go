'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RoutesDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

interface UsePatternsDetailRouteDataReturnType {
	data: RoutesDetail | undefined
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<RoutesDetail>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function usePatternsDetailRouteData(routeId: string): UsePatternsDetailRouteDataReturnType {
	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<RoutesDetail>>(routeId ? API_ROUTES.offer.ROUTES_DETAIL(routeId) : null, {
		fetcher: async (url: string) => await fetchApiData<RoutesDetail>({ url }),
		refreshInterval: 10_000,
	});

	return useMemo(() => ({
		data: data?.error || error ? undefined : data?.data,
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}

'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PatternsDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

interface UsePatternsDetailDataReturnType {
	data: PatternsDetail | undefined
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<PatternsDetail>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function usePatternsDetailData(patternId: string): UsePatternsDetailDataReturnType {
	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<PatternsDetail>>(patternId ? API_ROUTES.offer.PATTERNS_DETAIL(patternId) : null, {
		fetcher: async (url: string) => await fetchApiData<PatternsDetail>({ url }),
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

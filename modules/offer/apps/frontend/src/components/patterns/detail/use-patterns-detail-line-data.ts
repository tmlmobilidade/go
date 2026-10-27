'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

interface UsePatternsDetailLineDataReturnType {
	data: PopulatedLine | undefined
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<PopulatedLine>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function usePatternsDetailLineData(lineId: string): UsePatternsDetailLineDataReturnType {
	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<PopulatedLine>>(lineId ? API_ROUTES.offer.LINES_DETAIL(lineId) : null, {
		fetcher: async (url: string) => await fetchApiData<PopulatedLine>({ url }),
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

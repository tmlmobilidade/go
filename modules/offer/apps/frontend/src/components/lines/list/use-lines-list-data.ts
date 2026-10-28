'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

interface UseLinesListDataReturnType {
	data: PopulatedLine[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<PopulatedLine[]>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function useLinesListData(): UseLinesListDataReturnType {
	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<PopulatedLine[]>>(API_ROUTES.offer.LINES_LIST, {
		fetcher: async url => await fetchApiData<PopulatedLine[]>({ url }),
		refreshInterval: 5000,
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.error || error ? [] : data?.data ?? [],
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}

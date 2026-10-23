'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Fare } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseFaresDataReturnType {
	data: Fare[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useFaresData(): UseFaresDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Fare[]>>(API_ROUTES.offer.FARES_LIST, {
		fetcher: async (url: string) => await fetchApiData<Fare[]>({ url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}

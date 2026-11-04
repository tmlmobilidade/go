'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Fare } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { useFaresDetailFareId } from './use-fares-detail-fare-id';

/* * */

interface UseFaresDetailDataReturnType {
	data: Fare | null
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<Fare>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function useFaresDetailData(): UseFaresDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { fareId } = useFaresDetailFareId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Fare>>(fareId ? API_ROUTES.offer.FARES_DETAIL(fareId) : null, {
		fetcher: async (url: string) => await fetchApiData<Fare>({ url }),
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? null,
		error: data?.error ?? error?.message ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}

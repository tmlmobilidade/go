'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Typology } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { useTypologiesDetailTypologyId } from './use-typologies-detail-typology-id';

/* * */

interface UseTypologiesDetailDataReturnType {
	data: null | Typology
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<Typology>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function useTypologiesDetailData(): UseTypologiesDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { typologyId } = useTypologiesDetailTypologyId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Typology>>(typologyId ? API_ROUTES.offer.TYPOLOGIES_DETAIL(typologyId) : null, {
		fetcher: async (url: string) => await fetchApiData<Typology>({ url }),
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

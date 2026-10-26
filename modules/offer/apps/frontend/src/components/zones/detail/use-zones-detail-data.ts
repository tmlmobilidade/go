'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Zone } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { useZonesDetailZoneId } from './use-zones-detail-zone-id';

/* * */

interface UseZonesDetailDataReturnType {
	data: null | Zone
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<Zone>>
	timestamp: null | UnixMilliseconds
}

/* * */

export function useZonesDetailData(): UseZonesDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { zoneId } = useZonesDetailZoneId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Zone>>(zoneId ? API_ROUTES.offer.ZONES_DETAIL(zoneId) : null, {
		fetcher: async (url: string) => await fetchApiData<Zone>({ url }),
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

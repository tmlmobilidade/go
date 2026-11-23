'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AgencyReference } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

import { type SelectDataItem } from '../../components/inputs/Select';
import { fetchApiData } from '../../fetch/fetch-api-data';
import { toAgencySelectItem } from '../../filters/list/to-agency-select-item';

/* * */

interface UseAgenciesDataReturnType {
	data: AgencyReference[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<AgencyReference[]>>
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

/** Shared, cached agency lookup without requiring agency management permission. */
export function useAgenciesData({ enabled = true }: { enabled?: boolean } = {}): UseAgenciesDataReturnType {
	//

	//
	// A. Fetch basic agency references from Core

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<AgencyReference[]>>(enabled ? API_ROUTES.core.AGENCIES_LOOKUP : null, {
		fetcher: async (url: string) => await fetchApiData<AgencyReference[]>({ url }),
		shouldRetryOnError: false,
	});

	//
	// B. Return data

	return useMemo(() => {
		const agencies = data?.error || error ? [] : data?.data ?? [];
		return {
			data: agencies,
			error: data?.error ?? error?.message ?? null,
			ids: agencies.map(agency => agency._id),
			isLoading,
			isValidating,
			mutate,
			options: agencies.map(toAgencySelectItem),
			timestamp: data?.timestamp ?? null,
		};
	}, [data, error, isLoading, isValidating, mutate]);
}

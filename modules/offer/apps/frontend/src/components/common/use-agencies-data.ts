'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type LinesAgencyItem, type LinesAgencyRequest } from '@tmlmobilidade/go-offer-pckg-types';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseAgenciesDataReturnType<T extends LinesAgencyItem> {
	data: T[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

export function useAgenciesData(): UseAgenciesDataReturnType<Agency>;
export function useAgenciesData(query: LinesAgencyRequest): UseAgenciesDataReturnType<LinesAgencyItem>;
export function useAgenciesData(query?: LinesAgencyRequest): UseAgenciesDataReturnType<LinesAgencyItem> {
	//

	//
	// A. Fetch data

	const url = query ? API_ROUTES.offer.LINES_LIST_AGENCIES : API_ROUTES.offer.AGENCIES_LIST;
	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<LinesAgencyItem[]>>([url, query], {
		fetcher: async ([url, query]: [string, LinesAgencyRequest | undefined]) => query
			? await fetchApiData<LinesAgencyItem[], LinesAgencyRequest>({ body: query, method: 'POST', url })
			: await fetchApiData<Agency[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// B. Transform data

	const agencies = useMemo(() => {
		if (error || data?.error) return [];
		return data?.data ?? [];
	}, [data, error]);

	const ids = useMemo(() => agencies.map(agency => agency._id), [agencies]);

	const options = useMemo(() => agencies.map((agency): SelectDataItem => ({
		label: query ? `${agency.code} - ${agency.name}` : agency.name,
		value: agency._id,
	})), [agencies, query]);

	//
	// C. Return data

	return useMemo(() => ({
		data: agencies,
		error: error?.message ?? data?.error ?? null,
		ids,
		isLoading,
		isValidating,
		mutate,
		options,
		timestamp: data?.timestamp ?? null,
	}), [agencies, data?.error, data?.timestamp, error?.message, ids, isLoading, isValidating, mutate, options]);
};

'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type LinesAgencyItem, type LinesAgencyRequest } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseLinesAgenciesDataReturnType {
	data: LinesAgencyItem[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

export function useLinesAgenciesData(query: LinesAgencyRequest): UseLinesAgenciesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<LinesAgencyItem[]>>([API_ROUTES.offer.LINES_LIST_AGENCIES, query], {
		fetcher: async ([url, query]: [string, LinesAgencyRequest]) => await fetchApiData<LinesAgencyItem[], LinesAgencyRequest>({ body: query, method: 'POST', url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// B. Transform data

	const agencies = useMemo(() => {
		if (error || data?.error) return [];
		return data?.data ?? [];
	}, [data, error]);

	const ids = useMemo(() => agencies.map(agency => agency._id), [agencies]);

	const options = useMemo(() => [...agencies]
		.sort((a, b) => a.code.localeCompare(b.code, 'pt', { numeric: true }))
		.map((agency): SelectDataItem => ({
			label: `${agency.code} - ${agency.name}`,
			value: agency._id,
		})), [agencies]);

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

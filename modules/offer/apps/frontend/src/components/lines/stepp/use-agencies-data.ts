'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseSteppAgenciesDataReturnType {
	data: Agency[]
	error: null | string
	ids: string[]
	isLoading: boolean
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

export function useSteppAgenciesData(): UseSteppAgenciesDataReturnType {
	//

	//
	// A. Fetch data

	// This endpoint limits agencies to the user's lines.read agency_ids resources.
	const { data, error, isLoading } = useSWR<ApiResponse<Agency[]>>(API_ROUTES.offer.AGENCIES_LIST, {
		fetcher: async (url: string) => await fetchApiData<Agency[]>({ url }),
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
		options,
		timestamp: data?.timestamp ?? null,
	}), [agencies, data?.error, data?.timestamp, error?.message, ids, isLoading, options]);
}

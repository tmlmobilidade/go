'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseAgenciesDataReturnType {
	data: Agency[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/* * */

export function useAgenciesData(): UseAgenciesDataReturnType {
	//

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Agency[]>>(API_ROUTES.infrastructure.STOPS_LIST_AGENCIES, {
		fetcher: async (url: string) => await fetchApiData<Agency[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	const ids = useMemo(() => {
		return data?.data?.map(agency => agency._id) ?? [];
	}, [data?.data]);

	const options = useMemo(() => {
		return data?.data?.map(agency => ({ label: agency.name, value: agency._id })) ?? [];
	}, [data?.data]);

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		ids,
		isLoading,
		isValidating,
		mutate,
		options,
		timestamp: data?.timestamp,
	}), [data?.data, data?.timestamp, error, isLoading, isValidating, mutate]);
};

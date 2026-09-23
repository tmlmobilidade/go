'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseVehiclesAgenciesDataReturnType {
	data: Agency[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch agencies data for vehicles filters and selects.
 */
export function useVehiclesAgenciesData(): UseVehiclesAgenciesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<Agency[]>>(API_ROUTES.core.AGENCIES_LIST, {
		fetcher: async (url: string) => await fetchApiData<Agency[]>({ url }),
		refreshInterval: 300_000, // 5 minutes
	});

	//
	// B. Transform data

	const idsData = useMemo(() => {
		if (!data?.data?.length) return [];
		return data.data.map(item => item._id);
	}, [data?.data]);

	const optionsData = useMemo(() => {
		if (!data?.data?.length) return [];
		return data.data.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `${item._id} - ${item.name}`,
			value: item._id,
		}));
	}, [data?.data]);

	//
	// C. Return value

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		ids: idsData,
		isLoading,
		isValidating,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, data?.timestamp, error?.error, idsData, isLoading, isValidating, optionsData]);
};

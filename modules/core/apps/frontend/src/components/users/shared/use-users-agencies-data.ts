'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UsersAgencyItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseUsersAgenciesDataReturnType {
	error: null | string
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch agencies data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the agencies data.
 */
export function useUsersAgenciesData(): UseUsersAgenciesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<UsersAgencyItem[]>>(API_ROUTES.core.USERS_LIST_AGENCIES, {
		fetcher: async (url: string) => await fetchApiData<UsersAgencyItem[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// B. Transform data

	const optionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to SelectDataItem format
		return data.data.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.code} - ${item.name}`,
			value: item._id,
		}));
	}, [data?.data]);

	//
	// C. Return value

	return useMemo(() => ({
		error: error?.error,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, isLoading, isValidating, optionsData, data?.timestamp]);
};

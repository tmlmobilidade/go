'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UsersOrganizationItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseUsersOrganizationsDataReturnType {
	error: null | string
	options: SelectDataItem[]
	timestamp: null | UnixTimestamp
}

/**
 * Hook to fetch agencies data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the agencies data.
 */
export function useUsersOrganizationsData(): UseUsersOrganizationsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<UsersOrganizationItem[]>>(API_ROUTES.core.USERS_LIST_ORGANIZATIONS, {
		fetcher: async (url: string) => await fetchApiData<UsersOrganizationItem[]>({ url }),
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
			label: `[${item._id}] ${item.short_name} - ${item.long_name}`,
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

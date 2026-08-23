'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type UsersRoleItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseUsersRolesDataReturnType {
	error: null | string
	ids: string[]
	options: SelectDataItem[]
	timestamp: null | UnixTimestamp
}

/**
 * Hook to fetch agencies data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the agencies data.
 */
export function useUsersRolesData(): UseUsersRolesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<UsersRoleItem[]>>(API_ROUTES.core.USERS_LIST_ROLES, {
		fetcher: async (url: string) => await fetchApiData<UsersRoleItem[]>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// B. Transform data

	const idsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Keep only the IDs of the response data
		return data.data.map(item => item._id);
	}, [data?.data]);

	const optionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to SelectDataItem format
		return data.data.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.name}`,
			value: item._id,
		}));
	}, [data?.data]);

	//
	// C. Return value

	return useMemo(() => ({
		error: error?.error,
		ids: idsData,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, isLoading, isValidating, optionsData, data?.timestamp, idsData]);
};

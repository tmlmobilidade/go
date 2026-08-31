'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RolesMunicipalityItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseRolesMunicipalitiesDataReturnType {
	error: null | string
	options: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch municipalities data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the municipalities data.
 */
export function useRolesMunicipalitiesData(): UseRolesMunicipalitiesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<RolesMunicipalityItem[]>>(API_ROUTES.core.ROLES_LIST_MUNICIPALITIES, {
		fetcher: async (url: string) => await fetchApiData<RolesMunicipalityItem[]>({ url }),
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
			label: `[${item._id}] ${item.name}`,
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

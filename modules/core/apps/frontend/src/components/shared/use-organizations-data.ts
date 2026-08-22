'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Organization } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseOrganizationsDataReturnType {
	data: Organization[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	options: SelectDataItem[]
	timestamp: null | UnixTimestamp
}

/**
 * Hook to fetch agencies data. Useful for supplying data
 * to filters or select components.
 * @param props The request to fetch the agencies data.
 * @returns An object containing the agencies data.
 */
export function useOrganizationsData(): UseOrganizationsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<Organization[]>>(API_ROUTES.core.ORGANIZATIONS_LIST, {
		fetcher: async () => await fetchApiData<Organization[]>({ method: 'GET', url: API_ROUTES.core.ORGANIZATIONS_LIST }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

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
			label: `[${item._id}] ${item.long_name}`,
			value: item._id,
		}));
	}, [data?.data]);

	//
	// D. Return value

	return useMemo(() => ({
		data: data?.data ?? [],
		error: error?.error,
		ids: idsData,
		isLoading: isLoading,
		isValidating: isValidating,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, idsData, isLoading, isValidating, optionsData, data?.timestamp]);
};

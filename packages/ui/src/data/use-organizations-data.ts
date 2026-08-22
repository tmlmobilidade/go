'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type OrganizationsPlatformResponse } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type SelectDataItem } from '../components/inputs/Select';
import { fetchApiData } from '../fetch/fetch-api-data';

/* * */

interface UseOrganizationsDataReturnType {
	data: OrganizationsPlatformResponse[]
	error: null | string
	ids: string[]
	isLoading: boolean
	isValidating: boolean
	options: SelectDataItem[]
	timestamp: null | UnixTimestamp
}

/**
 * Hook to fetch organizations data. Useful for supplying data
 * to filters or select components.
 * @param props The request to fetch the organizations data.
 * @returns An object containing the organizations data.
 */
export function useOrganizationsData(): UseOrganizationsDataReturnType {
	//

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<OrganizationsPlatformResponse[]>>(API_ROUTES.core.PLATFORM_ORGANIZATIONS, {
		fetcher: async (url: string) => await fetchApiData<OrganizationsPlatformResponse[]>({ url }),
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
			label: `[${item._id}] ${item.short_name} - ${item.long_name}`,
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

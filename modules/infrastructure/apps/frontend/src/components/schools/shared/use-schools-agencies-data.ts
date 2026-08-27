'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SchoolsAgencyItem, SchoolsAgencyRequest } from '@tmlmobilidade/go-schools-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseSchoolsAgenciesDataReturnType {
	data: SchoolsAgencyItem[]
	error: null | string
	ids: string[]
	isLoading: boolean
	options: SelectDataItem[]
	timestamp: null | UnixTimestamp
}

/**
 * Hook to fetch agencies data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the agencies data.
 */
export function useSchoolsAgenciesData(query: SchoolsAgencyRequest): UseSchoolsAgenciesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<SchoolsAgencyItem[]>>([API_ROUTES.infrastructure.SCHOOLS_LIST_AGENCIES, query], {
		fetcher: async ([url, query]) => await fetchApiData<SchoolsAgencyItem[]>({ body: query, method: 'POST', url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const idsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to array of IDs
		return data.data.map(item => item._id);
	}, [data?.data]);

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
	// D. Return value

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		ids: idsData,
		isLoading,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, idsData, isLoading, isValidating, optionsData, data?.timestamp]);
};
